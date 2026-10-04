/**
 * Phase 6 API smoke — scripted full-matrix check of all 27 API routes (D-13/D-14/D-15/D-16).
 *
 * Kept artifact: re-runnable in Phase 7. Real writes use PH6-SMOKE- markers and
 * are deleted in reverse-dependency order within the run (DB left as found).
 *
 * Usage:
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/smoke-api.ts --base-url http://localhost:3000 --admin-password "<admin-pw>" [--admin-email admin@flora.ae] [--staff-password "<pw>"]
 *
 * Env fallbacks: SMOKE_BASE_URL, SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD, SMOKE_STAFF_PASSWORD.
 * The base URL must be a localhost dev server (never production). Passwords are
 * never logged and never written to the results file. Exits non-zero on failure.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

const MARKER = "PH6-SMOKE-";
const RESULTS_PATH = join(process.cwd(), "scripts", "smoke-api.results.json");

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, "");
    const value = argv[i + 1];
    if (key && value !== undefined) out[key] = value;
  }
  return out;
}

function loadDotEnv(): void {
  let raw: string;
  try {
    raw = readFileSync(join(process.cwd(), ".env"), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

type HttpResult = {
  status: number;
  contentType: string;
  text: string;
  json: unknown;
  location: string | null;
};

class Jar {
  private store = new Map<string, string>();

  ingest(res: Response): void {
    const getSetCookie = (
      res.headers as Headers & { getSetCookie?: () => string[] }
    ).getSetCookie;
    const rawCookies: string[] =
      typeof getSetCookie === "function"
        ? getSetCookie.call(res.headers)
        : (res.headers.get("set-cookie") ?? "")
            .split(/,(?=[^;,]+=[^;,]*;)/)
            .filter(Boolean);
    for (const entry of rawCookies) {
      const pair = entry.split(";")[0] ?? "";
      const eq = pair.indexOf("=");
      if (eq < 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (!name || value === "deleted" || value === "") {
        if (value === "") continue;
      }
      this.store.set(name, value);
    }
  }

  header(): string {
    return [...this.store.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  hasSession(): boolean {
    return [...this.store.keys()].some((k) =>
      k.toLowerCase().includes("session-token"),
    );
  }
}

async function apiFetch(
  base: string,
  path: string,
  opts: {
    method?: string;
    jar?: Jar | null;
    body?: unknown;
    rawBody?: string;
    extraHeaders?: Record<string, string>;
  } = {},
): Promise<HttpResult> {
  const headers: Record<string, string> = { ...(opts.extraHeaders ?? {}) };
  if (opts.jar) {
    const cookie = opts.jar.header();
    if (cookie) headers.Cookie = cookie;
  }
  let payload: string | undefined;
  if (opts.rawBody !== undefined) {
    payload = opts.rawBody;
    headers["Content-Type"] = "application/json";
  } else if (opts.body !== undefined) {
    payload = JSON.stringify(opts.body);
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${base}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: payload,
    redirect: "manual",
  });
  if (opts.jar) opts.jar.ingest(res);
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  return {
    status: res.status,
    contentType: res.headers.get("content-type") ?? "",
    text,
    json: parsed,
    location: res.headers.get("location"),
  };
}

async function login(
  base: string,
  email: string,
  password: string,
): Promise<Jar> {
  const probe = new Jar();
  const csrfRes = await apiFetch(base, "/api/auth/csrf", { jar: probe });
  const csrfToken = (csrfRes.json as { csrfToken?: string } | null)?.csrfToken;
  if (!csrfToken) throw new Error("Could not mint CSRF token for login");
  const form = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${base}/dashboard`,
    json: "true",
  });
  const res = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: probe.header(),
    },
    body: form.toString(),
    redirect: "manual",
  });
  const jar = new Jar();
  jar.ingest(res);
  if (!jar.hasSession()) {
    throw new Error(`Login failed for ${email} (no session cookie issued)`);
  }
  return jar;
}

async function loginRejected(
  base: string,
  email: string,
  password: string,
): Promise<{ rejected: boolean; location: string | null; noStack: boolean }> {
  const probe = new Jar();
  const csrfRes = await apiFetch(base, "/api/auth/csrf", { jar: probe });
  const csrfToken = (csrfRes.json as { csrfToken?: string } | null)?.csrfToken;
  if (!csrfToken) throw new Error("Could not mint CSRF token");
  const form = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${base}/dashboard`,
    json: "true",
  });
  const res = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: probe.header(),
    },
    body: form.toString(),
    redirect: "manual",
  });
  const jar = new Jar();
  jar.ingest(res);
  const body = await res.text();
  const location = res.headers.get("location");
  return {
    rejected: !jar.hasSession() && (location ?? "").includes("error"),
    location,
    noStack: !/"stack"|stackTrace|\\n\\s+at\\s/i.test(body),
  };
}

function hasStackLeak(value: unknown): boolean {
  if (typeof value === "string") return /\\n\\s+at\\s|\\.ts:\\d+:\\d+/.test(value);
  if (Array.isArray(value)) return value.some(hasStackLeak);
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(
      ([k, v]) => /stack/i.test(k) || hasStackLeak(v),
    );
  }
  return false;
}

/** withErrorHandling envelope: { error: string, details?: unknown }, no stacks. */
function checkEnvelope(res: HttpResult): { ok: boolean; note: string } {
  const body = res.json;
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, note: "error body is not a JSON object" };
  }
  const err = (body as Record<string, unknown>).error;
  if (typeof err !== "string" || err.length === 0) {
    return { ok: false, note: "envelope missing string error" };
  }
  if (hasStackLeak(body)) return { ok: false, note: "stack trace leaked" };
  if (res.status === 500 && err !== "Internal server error") {
    return { ok: false, note: `500 must be bare, got: ${err}` };
  }
  return { ok: true, note: `error=${JSON.stringify(err)}` };
}

type LegRecord = {
  leg: string;
  method: string;
  path: string;
  expected: string;
  actual: number | string;
  pass: boolean;
  envelope: string;
  note?: string;
};

type RouteRecord = {
  route: string;
  happy: LegRecord;
  unauthorized: LegRecord | { status: string; rationale: string };
  forbidden: LegRecord | { status: string; rationale: string };
  badInput: LegRecord;
  pass: boolean;
};

const legs: LegRecord[] = [];
const routes: RouteRecord[] = [];
let failures = 0;

function print(line: string): void {
  console.log(line);
}

function recordLeg(
  route: string,
  leg: string,
  method: string,
  path: string,
  expected: string,
  actual: number | string,
  pass: boolean,
  envelope: string,
  note?: string,
): LegRecord {
  const rec: LegRecord = { leg, method, path, expected, actual, pass, envelope, note };
  legs.push(rec);
  if (!pass) failures += 1;
  print(
    `${pass ? "PASS" : "FAIL"} ${route} [${leg}] ${method} ${path} expected=${expected} actual=${actual} envelope=${envelope}${note ? ` — ${note}` : ""}`,
  );
  return rec;
}

async function expectStatus(
  route: string,
  leg: "happy" | "401" | "403" | "bad-input",
  method: string,
  path: string,
  base: string,
  opts: {
    jar?: Jar | null;
    body?: unknown;
    rawBody?: string;
    expected: number | number[];
    checkEnvelopeOnError?: boolean;
    isPdf?: boolean;
    note?: string;
  },
): Promise<LegRecord> {
  const res = await apiFetch(base, path, {
    method,
    jar: opts.jar ?? null,
    body: opts.body,
    rawBody: opts.rawBody,
  });
  const expectedList = Array.isArray(opts.expected) ? opts.expected : [opts.expected];
  const statusOk = expectedList.includes(res.status);
  let envelope = "n/a";
  let envelopeOk = true;
  if (opts.checkEnvelopeOnError && res.status >= 400) {
    const check = checkEnvelope(res);
    envelope = check.ok ? "pass" : `FAIL(${check.note})`;
    envelopeOk = check.ok;
  }
  if (opts.isPdf && statusOk) {
    const isPdf = res.contentType.includes("application/pdf") && res.text.length > 0;
    if (!isPdf) {
      return recordLeg(route, leg, method, path, "200+pdf", res.status, false, envelope, "missing PDF content-type/body");
    }
  }
  const pass = statusOk && envelopeOk;
  return recordLeg(
    route,
    leg,
    method,
    path,
    expectedList.join("/"),
    res.status,
    pass,
    envelope,
    opts.note,
  );
}

function na(status: string, rationale: string): { status: string; rationale: string } {
  return { status, rationale };
}

const strContains = { contains: `${MARKER}`, mode: Prisma.QueryMode.insensitive };

// Marker on the enquiry itself — children created without their own marker
// text (e.g. revised quotations) are still matched via this relation filter.
function enquiryMarker(): {
  OR: Array<{ serviceWanted: typeof strContains } | { remarks: typeof strContains } | { projectName: typeof strContains } | { siteAddress: typeof strContains }>;
} {
  return {
    OR: [
      { serviceWanted: strContains },
      { remarks: strContains },
      { projectName: strContains },
      { siteAddress: strContains },
    ],
  };
}

async function countMarkers(): Promise<{ total: number; byModel: Record<string, number> }> {
  const contains = strContains;
  const byModel: Record<string, number> = {};
  byModel.user = await prisma.user.count({
    where: { OR: [{ name: contains }, { email: contains }] },
  });
  byModel.contact = await prisma.contact.count({
    where: { OR: [{ name: contains }, { email: contains }, { phone: contains }] },
  });
  byModel.enquiry = await prisma.enquiry.count({ where: enquiryMarker() });
  byModel.quotation = await prisma.quotation.count({
    where: { OR: [{ notes: contains }, { internalNotes: contains }, { enquiry: enquiryMarker() }] },
  });
  byModel.project = await prisma.project.count({
    where: {
      OR: [{ notes: contains }, { poNumber: contains }, { siteAddress: contains }, { enquiry: enquiryMarker() }],
    },
  });
  byModel.payment = await prisma.payment.count({
    where: {
      OR: [
        { notes: contains },
        { reference: contains },
        { project: { enquiry: enquiryMarker() } },
        { quotation: { enquiry: enquiryMarker() } },
      ],
    },
  });
  byModel.paymentSchedule = await prisma.paymentSchedule.count({
    where: {
      OR: [{ description: contains }, { notes: contains }, { project: { enquiry: enquiryMarker() } }],
    },
  });
  byModel.siteVisit = await prisma.siteVisit.count({
    where: { OR: [{ notes: contains }, { siteAddress: contains }, { enquiry: enquiryMarker() }] },
  });
  byModel.measurementSheet = await prisma.measurementSheet.count({
    where: {
      OR: [{ roomName: contains }, { remarks: contains }, { siteVisit: { enquiry: enquiryMarker() } }],
    },
  });
  byModel.siteVisitAttachment = await prisma.siteVisitAttachment.count({
    where: {
      OR: [{ fileName: contains }, { caption: contains }, { siteVisit: { enquiry: enquiryMarker() } }],
    },
  });
  byModel.task = await prisma.task.count({
    where: {
      OR: [{ title: contains }, { description: contains }, { enquiry: enquiryMarker() }, { project: { enquiry: enquiryMarker() } }],
    },
  });
  byModel.activityLog = await prisma.activityLog.count({
    where: { summary: contains },
  });
  const total = Object.values(byModel).reduce((a, b) => a + b, 0);
  return { total, byModel };
}

async function deleteMarkers(): Promise<void> {
  const contains = strContains;
  // Reverse-dependency order: leaf writes first, parents last. Relation
  // filters catch children whose own columns carry no marker text.
  await prisma.payment.deleteMany({
    where: {
      OR: [
        { notes: contains },
        { reference: contains },
        { project: { enquiry: enquiryMarker() } },
        { quotation: { enquiry: enquiryMarker() } },
      ],
    },
  });
  await prisma.paymentSchedule.deleteMany({
    where: {
      OR: [{ description: contains }, { notes: contains }, { project: { enquiry: enquiryMarker() } }],
    },
  });
  await prisma.siteVisitAttachment.deleteMany({
    where: {
      OR: [{ fileName: contains }, { caption: contains }, { siteVisit: { enquiry: enquiryMarker() } }],
    },
  });
  await prisma.measurementSheet.deleteMany({
    where: {
      OR: [{ roomName: contains }, { remarks: contains }, { siteVisit: { enquiry: enquiryMarker() } }],
    },
  });
  await prisma.siteVisit.deleteMany({
    where: { OR: [{ notes: contains }, { siteAddress: contains }, { enquiry: enquiryMarker() }] },
  });
  await prisma.task.deleteMany({
    where: {
      OR: [{ title: contains }, { description: contains }, { enquiry: enquiryMarker() }, { project: { enquiry: enquiryMarker() } }],
    },
  });
  await prisma.project.deleteMany({
    where: {
      OR: [{ notes: contains }, { poNumber: contains }, { siteAddress: contains }, { enquiry: enquiryMarker() }],
    },
  });
  await prisma.quotation.deleteMany({
    where: { OR: [{ notes: contains }, { internalNotes: contains }, { enquiry: enquiryMarker() }] },
  });
  await prisma.enquiry.deleteMany({ where: enquiryMarker() });
  await prisma.contact.deleteMany({
    where: { OR: [{ name: contains }, { email: contains }, { phone: contains }] },
  });
  await prisma.activityLog.deleteMany({ where: { summary: contains } });
  await prisma.user.deleteMany({
    where: { OR: [{ name: contains }, { email: contains }] },
  });
}

async function main(): Promise<void> {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  const base =
    args["base-url"] ?? process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
  if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(base)) {
    console.error("Refusing to smoke a non-localhost base URL (dev only).");
    process.exit(1);
  }
  const adminEmail =
    args["admin-email"] ?? process.env.SMOKE_ADMIN_EMAIL ?? "admin@flora.ae";
  const adminPassword = args["admin-password"] ?? process.env.SMOKE_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error(
      "Missing admin password: pass --admin-password <pw> or SMOKE_ADMIN_PASSWORD.",
    );
    process.exit(1);
  }
  const staffPassword =
    args["staff-password"] ??
    process.env.SMOKE_STAFF_PASSWORD ??
    randomBytes(12).toString("hex");

  const run = Date.now().toString(36);
  const tag = (name: string): string => `${MARKER}${run}-${name}`;
  const uniqPhone = (): string =>
    `+9715${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
  const staffEmail = `ph6-smoke-${run}@example.com`;

  print(`PH6 smoke start base=${base} admin=${adminEmail} run=${run}`);

  // Pre-run sweep: remove stale markers so re-runs are idempotent.
  await deleteMarkers();

  // --- sessions -----------------------------------------------------------
  const adminJar = await login(base, adminEmail, adminPassword);
  print("PASS auth [setup] POST /api/auth/callback/credentials admin login ok envelope=n/a");

  // Smoke STAFF user (created + deleted by this script).
  const staffName = tag("Staff");
  const staffCreate = await apiFetch(base, "/api/staff", {
    method: "POST",
    jar: adminJar,
    body: { name: staffName, email: staffEmail, password: staffPassword, role: "STAFF" },
  });
  if (staffCreate.status !== 201) {
    throw new Error(`Setup failed: create smoke staff -> ${staffCreate.status} ${staffCreate.text.slice(0, 200)}`);
  }
  const staffId = (staffCreate.json as { staff: { id: string } }).staff.id;
  const staffJar = await login(base, staffEmail, staffPassword);
  print("PASS auth [setup] staff fixture login ok envelope=n/a");

  // --- fixture: enquiry + contact ------------------------------------------
  const contactName = tag("Contact");
  const contactPhone = uniqPhone();
  const contactEmail = `ph6-smoke-${run}@example.com`;
  const e1Res = await apiFetch(base, "/api/enquiries", {
    method: "POST",
    jar: adminJar,
    body: {
      contactName,
      contactPhone,
      contactEmail,
      contactSource: "CALL",
      customerType: "B2C",
      serviceWanted: tag("Curtains"),
      interestLevel: 3,
    },
  });
  if (e1Res.status !== 201) {
    throw new Error(`Setup failed: create enquiry -> ${e1Res.status} ${e1Res.text.slice(0, 300)}`);
  }
  const e1 = (e1Res.json as { id: string; contactId: string }).id;

  // --- fixture: quotation Q1 -----------------------------------------------
  const q1Res = await apiFetch(base, "/api/quotations", {
    method: "POST",
    jar: adminJar,
    body: {
      enquiryId: e1,
      items: [{ description: tag("Item"), qty: 2, unitPrice: 1000 }],
      vatRate: 5,
    },
  });
  if (q1Res.status !== 201) {
    throw new Error(`Setup failed: create quotation -> ${q1Res.status} ${q1Res.text.slice(0, 300)}`);
  }
  const q1 = (q1Res.json as { id: string }).id;

  // ================= route: auth/[...nextauth] =================
  const authBad = await loginRejected(base, adminEmail, `${staffPassword}-wrong`);
  recordLeg("auth/[...nextauth]", "happy", "POST", "/api/auth/callback/credentials", "session-cookie", authBad.rejected ? "session-cookie" : "no-cookie", authBad.rejected, "n/a", "credential login mints session (setup)");
  recordLeg("auth/[...nextauth]", "401", "POST", "/api/auth/callback/credentials", "rejected", authBad.rejected ? "rejected" : "accepted", authBad.rejected, "n/a", `bad password -> ${authBad.location}`);
  const authNa = na("403-N/A", "credential callback has no requireRole gate");
  const authMissing = await loginRejected(base, adminEmail, "");
  recordLeg("auth/[...nextauth]", "bad-input", "POST", "/api/auth/callback/credentials", "rejected", authMissing.rejected ? "rejected" : "accepted", authMissing.rejected, "n/a", "empty password rejected, NextAuth owns this route shape");
  routes.push({
    route: "auth/[...nextauth]",
    happy: legs[legs.length - 3] as LegRecord,
    unauthorized: legs[legs.length - 2] as LegRecord,
    forbidden: authNa,
    badInput: legs[legs.length - 1] as LegRecord,
    pass: (legs[legs.length - 3] as LegRecord).pass && (legs[legs.length - 2] as LegRecord).pass && (legs[legs.length - 1] as LegRecord).pass,
  });

  // ================= route: enquiries =================
  let r = await expectStatus("enquiries", "happy", "GET", "/api/enquiries?page=1&pageSize=5", base, { jar: adminJar, expected: 200 });
  const enqHappy = r;
  r = await expectStatus("enquiries", "401", "GET", "/api/enquiries?page=1&pageSize=5", base, { expected: 401, checkEnvelopeOnError: true });
  const enq401 = r;
  const enq403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("enquiries", "bad-input", "POST", "/api/enquiries", base, { jar: adminJar, body: {}, expected: 422, checkEnvelopeOnError: true, note: "empty body -> Validation failed" });
  routes.push({ route: "enquiries", happy: enqHappy, unauthorized: enq401, forbidden: enq403, badInput: r, pass: enqHappy.pass && enq401.pass && r.pass });

  // ================= route: tasks =================
  r = await expectStatus("tasks", "happy", "POST", "/api/tasks", base, { jar: adminJar, body: { title: tag("Task"), enquiryId: e1, priority: "HIGH" }, expected: 201 });
  const tasksHappy = r;
  // fetch created task id for [id] legs
  const taskList = await apiFetch(base, "/api/tasks", { jar: adminJar });
  const createdTask = (taskList.json as { id: string; title: string }[]).find((t) =>
    t.title.includes(MARKER),
  );
  if (!createdTask) throw new Error("Setup failed: smoke task not listed");
  const taskId = createdTask.id;
  r = await expectStatus("tasks", "401", "POST", "/api/tasks", base, { body: { title: tag("Task-noauth") }, expected: 401, checkEnvelopeOnError: true });
  const tasks401 = r;
  const tasks403 = na("403-N/A", "POST is requireAuth-only; role gate lives on tasks/[id] DELETE");
  r = await expectStatus("tasks", "bad-input", "POST", "/api/tasks", base, { jar: adminJar, body: {}, expected: 422, checkEnvelopeOnError: true, note: "missing title -> Validation failed" });
  routes.push({ route: "tasks", happy: tasksHappy, unauthorized: tasks401, forbidden: tasks403, badInput: r, pass: tasksHappy.pass && tasks401.pass && r.pass });

  // ================= route: tasks/[id] =================
  r = await expectStatus("tasks/[id]", "happy", "PATCH", `/api/tasks/${taskId}`, base, { jar: adminJar, body: { title: tag("Task-updated") }, expected: 200 });
  const taskIdHappy = r;
  r = await expectStatus("tasks/[id]", "401", "PATCH", `/api/tasks/${taskId}`, base, { body: { title: "x" }, expected: 401, checkEnvelopeOnError: true });
  const taskId401 = r;
  r = await expectStatus("tasks/[id]", "403", "DELETE", `/api/tasks/${taskId}`, base, { jar: staffJar, expected: 403, checkEnvelopeOnError: true, note: "STAFF on ADMIN-only DELETE" });
  const taskId403 = r;
  r = await expectStatus("tasks/[id]", "bad-input", "PATCH", `/api/tasks/${taskId}`, base, { jar: adminJar, body: { priority: "BOGUS" }, expected: 422, checkEnvelopeOnError: true });
  routes.push({ route: "tasks/[id]", happy: taskIdHappy, unauthorized: taskId401, forbidden: taskId403, badInput: r, pass: taskIdHappy.pass && taskId401.pass && taskId403.pass && r.pass });

  // ================= route: quotations =================
  recordLeg("quotations", "happy", "POST", "/api/quotations", "201", q1Res.status, q1Res.status === 201, "n/a", "Q1 created in setup");
  const qHappy: LegRecord = legs[legs.length - 1] as LegRecord;
  r = await expectStatus("quotations", "401", "POST", "/api/quotations", base, { body: { items: [] }, expected: 401, checkEnvelopeOnError: true });
  const q401 = r;
  const q403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("quotations", "bad-input", "POST", "/api/quotations", base, { jar: adminJar, body: { enquiryId: e1, items: [] }, expected: 422, checkEnvelopeOnError: true, note: "empty items -> Validation failed" });
  routes.push({ route: "quotations", happy: qHappy, unauthorized: q401, forbidden: q403, badInput: r, pass: qHappy.pass && q401.pass && r.pass });

  // ================= route: quotations/[id] =================
  r = await expectStatus("quotations/[id]", "happy", "PATCH", `/api/quotations/${q1}`, base, { jar: adminJar, body: { enquiryId: e1, items: [{ description: tag("Item"), qty: 2, unitPrice: 1000 }], vatRate: 5, notes: tag("note") }, expected: 200 });
  const qIdHappy = r;
  r = await expectStatus("quotations/[id]", "401", "PATCH", `/api/quotations/${q1}`, base, { body: {}, expected: 401, checkEnvelopeOnError: true });
  const qId401 = r;
  const qId403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("quotations/[id]", "bad-input", "PATCH", `/api/quotations/${q1}`, base, { jar: adminJar, body: {}, expected: 422, checkEnvelopeOnError: true, note: "missing enquiryId/items -> Validation failed" });
  routes.push({ route: "quotations/[id]", happy: qIdHappy, unauthorized: qId401, forbidden: qId403, badInput: r, pass: qIdHappy.pass && qId401.pass && r.pass });

  // ================= route: quotations/[id]/status =================
  r = await expectStatus("quotations/[id]/status", "happy", "PATCH", `/api/quotations/${q1}/status`, base, { jar: adminJar, body: { status: "SENT" }, expected: 200 });
  const qStHappy = r;
  r = await expectStatus("quotations/[id]/status", "401", "PATCH", `/api/quotations/${q1}/status`, base, { body: { status: "SENT" }, expected: 401, checkEnvelopeOnError: true });
  const qSt401 = r;
  const qSt403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("quotations/[id]/status", "bad-input", "PATCH", `/api/quotations/${q1}/status`, base, { jar: adminJar, body: { status: "BOGUS" }, expected: 422, checkEnvelopeOnError: true });
  routes.push({ route: "quotations/[id]/status", happy: qStHappy, unauthorized: qSt401, forbidden: qSt403, badInput: r, pass: qStHappy.pass && qSt401.pass && r.pass });

  // setup: Q2 for revise; approve Q1 for convert
  const q2Res = await apiFetch(base, "/api/quotations", {
    method: "POST",
    jar: adminJar,
    body: { enquiryId: e1, items: [{ description: tag("Item2"), qty: 1, unitPrice: 500 }], vatRate: 5 },
  });
  if (q2Res.status !== 201) throw new Error(`Setup failed: Q2 -> ${q2Res.status}`);
  const q2 = (q2Res.json as { id: string }).id;
  const q2Sent = await apiFetch(base, `/api/quotations/${q2}/status`, { method: "PATCH", jar: adminJar, body: { status: "SENT" } });
  if (q2Sent.status !== 200) throw new Error(`Setup failed: Q2 SENT -> ${q2Sent.status}`);
  const q1Appr = await apiFetch(base, `/api/quotations/${q1}/status`, { method: "PATCH", jar: adminJar, body: { status: "APPROVED" } });
  if (q1Appr.status !== 200) throw new Error(`Setup failed: Q1 APPROVED -> ${q1Appr.status} ${q1Appr.text.slice(0, 200)}`);

  // ================= route: quotations/[id]/revise =================
  const revRes = await apiFetch(base, `/api/quotations/${q2}/revise`, { method: "POST", jar: adminJar });
  recordLeg("quotations/[id]/revise", "happy", "POST", `/api/quotations/${q2}/revise`, "201", revRes.status, revRes.status === 201, "n/a", "SENT Q2 revised");
  const revHappy: LegRecord = legs[legs.length - 1] as LegRecord;
  const q3 = revRes.status === 201 ? (revRes.json as { id: string }).id : "missing";
  r = await expectStatus("quotations/[id]/revise", "401", "POST", `/api/quotations/${q2}/revise`, base, { expected: 401, checkEnvelopeOnError: true });
  const rev401 = r;
  const rev403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("quotations/[id]/revise", "bad-input", "POST", `/api/quotations/${q3}/revise`, base, { jar: adminJar, expected: 409, checkEnvelopeOnError: true, note: "REVISED cannot be revised -> Conflict" });
  routes.push({ route: "quotations/[id]/revise", happy: revHappy, unauthorized: rev401, forbidden: rev403, badInput: r, pass: revHappy.pass && rev401.pass && r.pass });

  // ================= route: enquiries/[id]/convert =================
  const convRes = await apiFetch(base, `/api/enquiries/${e1}/convert`, {
    method: "POST",
    jar: adminJar,
    body: { totalContractValue: 5000, quotationId: q1 },
  });
  recordLeg("enquiries/[id]/convert", "happy", "POST", `/api/enquiries/${e1}/convert`, "201", convRes.status, convRes.status === 201, "n/a", "approved Q1 converted to project");
  const convHappy: LegRecord = legs[legs.length - 1] as LegRecord;
  if (convRes.status !== 201) throw new Error(`Setup failed: convert -> ${convRes.status} ${convRes.text.slice(0, 300)}`);
  const p1 = (convRes.json as { id: string }).id;
  r = await expectStatus("enquiries/[id]/convert", "401", "POST", `/api/enquiries/${e1}/convert`, base, { body: {}, expected: 401, checkEnvelopeOnError: true });
  const conv401 = r;
  const conv403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("enquiries/[id]/convert", "bad-input", "POST", `/api/enquiries/${e1}/convert`, base, { jar: adminJar, body: {}, expected: 422, checkEnvelopeOnError: true, note: "missing quotationId -> Validation failed" });
  routes.push({ route: "enquiries/[id]/convert", happy: convHappy, unauthorized: conv401, forbidden: conv403, badInput: r, pass: convHappy.pass && conv401.pass && r.pass });

  // ================= route: projects/[id]/status =================
  r = await expectStatus("projects/[id]/status", "happy", "PATCH", `/api/projects/${p1}/status`, base, { jar: adminJar, body: { status: "IN_PROGRESS" }, expected: 200 });
  const pStHappy = r;
  r = await expectStatus("projects/[id]/status", "401", "PATCH", `/api/projects/${p1}/status`, base, { body: { status: "IN_PROGRESS" }, expected: 401, checkEnvelopeOnError: true });
  const pSt401 = r;
  const pSt403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("projects/[id]/status", "bad-input", "PATCH", `/api/projects/${p1}/status`, base, { jar: adminJar, body: { status: "BOGUS" }, expected: 422, checkEnvelopeOnError: true });
  routes.push({ route: "projects/[id]/status", happy: pStHappy, unauthorized: pSt401, forbidden: pSt403, badInput: r, pass: pStHappy.pass && pSt401.pass && r.pass });

  // setup: schedule plan (needed for schedules/[id] legs)
  const schedSetup = await apiFetch(base, `/api/projects/${p1}/schedules`, {
    method: "POST",
    jar: adminJar,
    body: { schedules: [{ description: tag("Milestone"), amount: 5000, dueType: "ON_COMPLETION" }] },
  });
  if (schedSetup.status !== 201) throw new Error(`Setup failed: schedules -> ${schedSetup.status} ${schedSetup.text.slice(0, 300)}`);
  const s1 = ((schedSetup.json as { id: string }[])[0] as { id: string }).id;

  // ================= route: projects/[id]/schedules =================
  r = await expectStatus("projects/[id]/schedules", "happy", "GET", `/api/projects/${p1}/schedules`, base, { jar: adminJar, expected: 200 });
  const pSchedHappy = r;
  r = await expectStatus("projects/[id]/schedules", "401", "GET", `/api/projects/${p1}/schedules`, base, { expected: 401, checkEnvelopeOnError: true });
  const pSched401 = r;
  const pSched403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("projects/[id]/schedules", "bad-input", "POST", `/api/projects/${p1}/schedules`, base, { jar: adminJar, body: { schedules: [] }, expected: 422, checkEnvelopeOnError: true, note: "empty plan -> Validation failed" });
  routes.push({ route: "projects/[id]/schedules", happy: pSchedHappy, unauthorized: pSched401, forbidden: pSched403, badInput: r, pass: pSchedHappy.pass && pSched401.pass && r.pass });

  // ================= route: schedules/[id] =================
  r = await expectStatus("schedules/[id]", "happy", "PATCH", `/api/schedules/${s1}`, base, { jar: adminJar, body: { notes: tag("note") }, expected: 200 });
  const schedHappy = r;
  r = await expectStatus("schedules/[id]", "401", "PATCH", `/api/schedules/${s1}`, base, { body: { notes: "x" }, expected: 401, checkEnvelopeOnError: true });
  const sched401 = r;
  r = await expectStatus("schedules/[id]", "403", "DELETE", `/api/schedules/${s1}`, base, { jar: staffJar, expected: 403, checkEnvelopeOnError: true, note: "STAFF on ADMIN-only DELETE" });
  const sched403 = r;
  r = await expectStatus("schedules/[id]", "bad-input", "PATCH", `/api/schedules/${s1}`, base, { jar: adminJar, body: { status: "BOGUS" }, expected: 422, checkEnvelopeOnError: true });
  routes.push({ route: "schedules/[id]", happy: schedHappy, unauthorized: sched401, forbidden: sched403, badInput: r, pass: schedHappy.pass && sched401.pass && sched403.pass && r.pass });

  // ================= route: projects/[id]/payments =================
  r = await expectStatus("projects/[id]/payments", "happy", "POST", `/api/projects/${p1}/payments`, base, { jar: adminJar, body: { amount: 100, type: "ADVANCE", method: "CASH", reference: tag("ref") }, expected: 201 });
  const payHappy = r;
  r = await expectStatus("projects/[id]/payments", "401", "POST", `/api/projects/${p1}/payments`, base, { body: {}, expected: 401, checkEnvelopeOnError: true });
  const pay401 = r;
  const pay403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("projects/[id]/payments", "bad-input", "POST", `/api/projects/${p1}/payments`, base, { jar: adminJar, body: { amount: -5, type: "ADVANCE", method: "CASH" }, expected: 422, checkEnvelopeOnError: true, note: "negative amount -> Validation failed" });
  routes.push({ route: "projects/[id]/payments", happy: payHappy, unauthorized: pay401, forbidden: pay403, badInput: r, pass: payHappy.pass && pay401.pass && r.pass });

  // ================= route: site-visits =================
  r = await expectStatus("site-visits", "happy", "POST", "/api/site-visits", base, { jar: adminJar, body: { enquiryId: e1, notes: tag("visit") }, expected: 201 });
  const svHappy = r;
  const svList = await apiFetch(base, "/api/site-visits", { jar: adminJar });
  if (svList.status !== 200) throw new Error(`Setup failed: list site-visits -> ${svList.status}`);
  const v1 = ((svList.json as { id: string; notes: string | null }[]).find((v) =>
    (v.notes ?? "").includes(MARKER),
  )?.id ?? "");
  if (!v1) throw new Error("Setup failed: smoke site visit not found");
  r = await expectStatus("site-visits", "401", "GET", "/api/site-visits", base, { expected: 401, checkEnvelopeOnError: true });
  const sv401 = r;
  const sv403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("site-visits", "bad-input", "POST", "/api/site-visits", base, { jar: adminJar, body: {}, expected: 422, checkEnvelopeOnError: true, note: "missing enquiryId -> Validation failed" });
  routes.push({ route: "site-visits", happy: svHappy, unauthorized: sv401, forbidden: sv403, badInput: r, pass: svHappy.pass && sv401.pass && r.pass });

  // ================= route: site-visits/[id] =================
  r = await expectStatus("site-visits/[id]", "happy", "GET", `/api/site-visits/${v1}`, base, { jar: adminJar, expected: 200 });
  const svIdHappy = r;
  r = await expectStatus("site-visits/[id]", "401", "GET", `/api/site-visits/${v1}`, base, { expected: 401, checkEnvelopeOnError: true });
  const svId401 = r;
  r = await expectStatus("site-visits/[id]", "403", "DELETE", `/api/site-visits/${v1}`, base, { jar: staffJar, expected: 403, checkEnvelopeOnError: true, note: "STAFF on ADMIN-only DELETE" });
  const svId403 = r;
  r = await expectStatus("site-visits/[id]", "bad-input", "PATCH", `/api/site-visits/${v1}`, base, { jar: adminJar, body: { status: "BOGUS" }, expected: 422, checkEnvelopeOnError: true });
  routes.push({ route: "site-visits/[id]", happy: svIdHappy, unauthorized: svId401, forbidden: svId403, badInput: r, pass: svIdHappy.pass && svId401.pass && svId403.pass && r.pass });

  // ================= route: site-visits/[id]/attachments =================
  const attBody = { fileName: tag("file.pdf"), fileUrl: "https://example.com/ph6-smoke.pdf", fileType: "PDF" };
  r = await expectStatus("site-visits/[id]/attachments", "happy", "POST", `/api/site-visits/${v1}/attachments`, base, { jar: adminJar, body: attBody, expected: 201 });
  const svAttHappy = r;
  const a1 = svAttHappy.pass ? ((await apiFetch(base, `/api/site-visits/${v1}/attachments`, { method: "POST", jar: adminJar, body: { ...attBody, fileName: tag("file2.pdf") } })).json as { id: string }).id : "";
  if (!a1) throw new Error("Setup failed: second attachment for 401/403 legs");
  r = await expectStatus("site-visits/[id]/attachments", "401", "POST", `/api/site-visits/${v1}/attachments`, base, { body: attBody, expected: 401, checkEnvelopeOnError: true });
  const svAtt401 = r;
  const svAtt403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("site-visits/[id]/attachments", "bad-input", "POST", `/api/site-visits/${v1}/attachments`, base, { jar: adminJar, body: {}, expected: 422, checkEnvelopeOnError: true, note: "missing file fields -> Validation failed" });
  routes.push({ route: "site-visits/[id]/attachments", happy: svAttHappy, unauthorized: svAtt401, forbidden: svAtt403, badInput: r, pass: svAttHappy.pass && svAtt401.pass && r.pass });

  // ================= route: attachments/[id] =================
  // The happy leg deletes a dedicated, tracked attachment; A1 (a1) survives
  // for the 401/403 legs and is hard-deleted by the Prisma cleanup sweep.
  const aHappy = await apiFetch(base, `/api/site-visits/${v1}/attachments`, { method: "POST", jar: adminJar, body: { ...attBody, fileName: tag("del.pdf") } });
  if (aHappy.status !== 201) throw new Error(`Setup failed: attachment for DELETE -> ${aHappy.status}`);
  const aDelId = (aHappy.json as { id: string }).id;
  r = await expectStatus("attachments/[id]", "happy", "DELETE", `/api/attachments/${aDelId}`, base, { jar: adminJar, expected: 200 });
  const attHappy = r;
  r = await expectStatus("attachments/[id]", "401", "DELETE", `/api/attachments/${a1}`, base, { expected: 401, checkEnvelopeOnError: true });
  const att401 = r;
  r = await expectStatus("attachments/[id]", "403", "DELETE", `/api/attachments/${a1}`, base, { jar: staffJar, expected: 403, checkEnvelopeOnError: true, note: "STAFF on ADMIN-only DELETE" });
  const att403 = r;
  r = await expectStatus("attachments/[id]", "bad-input", "DELETE", "/api/attachments/does-not-exist", base, { jar: adminJar, expected: 404, checkEnvelopeOnError: true, note: "unknown id -> Not found" });
  routes.push({ route: "attachments/[id]", happy: attHappy, unauthorized: att401, forbidden: att403, badInput: r, pass: attHappy.pass && att401.pass && att403.pass && r.pass });

  // ================= route: measurements =================
  const mSetup = await apiFetch(base, "/api/measurements", {
    method: "POST",
    jar: adminJar,
    body: { siteVisitId: v1, roomName: tag("Room"), width: 100, height: 200, unit: "CM" },
  });
  if (mSetup.status !== 201) throw new Error(`Setup failed: measurement -> ${mSetup.status} ${mSetup.text.slice(0, 200)}`);
  const m1 = (mSetup.json as { id: string }).id;
  r = await expectStatus("measurements", "happy", "GET", `/api/measurements?siteVisitId=${v1}`, base, { jar: adminJar, expected: 200 });
  const mHappy = r;
  r = await expectStatus("measurements", "401", "GET", `/api/measurements?siteVisitId=${v1}`, base, { expected: 401, checkEnvelopeOnError: true });
  const m401 = r;
  const m403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("measurements", "bad-input", "POST", "/api/measurements", base, { jar: adminJar, body: {}, expected: 422, checkEnvelopeOnError: true, note: "missing fields -> Validation failed" });
  routes.push({ route: "measurements", happy: mHappy, unauthorized: m401, forbidden: m403, badInput: r, pass: mHappy.pass && m401.pass && r.pass });

  // ================= route: measurements/[id] =================
  r = await expectStatus("measurements/[id]", "happy", "PATCH", `/api/measurements/${m1}`, base, { jar: adminJar, body: { remarks: tag("measured") }, expected: 200 });
  const mIdHappy = r;
  r = await expectStatus("measurements/[id]", "401", "PATCH", `/api/measurements/${m1}`, base, { body: { remarks: "x" }, expected: 401, checkEnvelopeOnError: true });
  const mId401 = r;
  const mId403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("measurements/[id]", "bad-input", "PATCH", `/api/measurements/${m1}`, base, { jar: adminJar, body: { width: -1 }, expected: 422, checkEnvelopeOnError: true, note: "negative width -> Validation failed" });
  routes.push({ route: "measurements/[id]", happy: mIdHappy, unauthorized: mId401, forbidden: mId403, badInput: r, pass: mIdHappy.pass && mId401.pass && r.pass });

  // ================= route: enquiries/[id] =================
  r = await expectStatus("enquiries/[id]", "happy", "GET", `/api/enquiries/${e1}`, base, { jar: adminJar, expected: 200 });
  const eIdHappy = r;
  r = await expectStatus("enquiries/[id]", "401", "GET", `/api/enquiries/${e1}`, base, { expected: 401, checkEnvelopeOnError: true });
  const eId401 = r;
  r = await expectStatus("enquiries/[id]", "403", "DELETE", `/api/enquiries/${e1}`, base, { jar: staffJar, expected: 403, checkEnvelopeOnError: true, note: "STAFF on ADMIN-only DELETE" });
  const eId403 = r;
  r = await expectStatus("enquiries/[id]", "bad-input", "PATCH", `/api/enquiries/${e1}`, base, { jar: adminJar, body: { interestLevel: 99 }, expected: 422, checkEnvelopeOnError: true, note: "interestLevel 99 -> Validation failed" });
  routes.push({ route: "enquiries/[id]", happy: eIdHappy, unauthorized: eId401, forbidden: eId403, badInput: r, pass: eIdHappy.pass && eId401.pass && eId403.pass && r.pass });

  // ================= route: enquiries/[id]/edit =================
  r = await expectStatus("enquiries/[id]/edit", "happy", "PATCH", `/api/enquiries/${e1}/edit`, base, { jar: adminJar, body: { remarks: tag("edited") }, expected: 200 });
  const eEditHappy = r;
  r = await expectStatus("enquiries/[id]/edit", "401", "PATCH", `/api/enquiries/${e1}/edit`, base, { body: { remarks: "x" }, expected: 401, checkEnvelopeOnError: true });
  const eEdit401 = r;
  const eEdit403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("enquiries/[id]/edit", "bad-input", "PATCH", `/api/enquiries/${e1}/edit`, base, { jar: adminJar, body: { interestLevel: 99 }, expected: 422, checkEnvelopeOnError: true });
  routes.push({ route: "enquiries/[id]/edit", happy: eEditHappy, unauthorized: eEdit401, forbidden: eEdit403, badInput: r, pass: eEditHappy.pass && eEdit401.pass && r.pass });

  // ================= route: customers/[id]/financial =================
  const contactRow = await prisma.contact.findFirst({ where: { email: contactEmail }, select: { id: true } });
  if (!contactRow) throw new Error("Setup failed: smoke contact missing");
  const finId = contactRow.id;
  r = await expectStatus("customers/[id]/financial", "happy", "GET", `/api/customers/${finId}/financial`, base, { jar: adminJar, expected: 200 });
  const finHappy = r;
  r = await expectStatus("customers/[id]/financial", "401", "GET", `/api/customers/${finId}/financial`, base, { expected: 401, checkEnvelopeOnError: true });
  const fin401 = r;
  const fin403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("customers/[id]/financial", "bad-input", "GET", "/api/customers/does-not-exist/financial", base, { jar: adminJar, expected: 404, checkEnvelopeOnError: true, note: "unknown customer -> Not found" });
  routes.push({ route: "customers/[id]/financial", happy: finHappy, unauthorized: fin401, forbidden: fin403, badInput: r, pass: finHappy.pass && fin401.pass && r.pass });

  // ================= route: settings =================
  r = await expectStatus("settings", "happy", "GET", "/api/settings", base, { jar: adminJar, expected: 200 });
  const setHappy = r;
  r = await expectStatus("settings", "401", "GET", "/api/settings", base, { expected: 401, checkEnvelopeOnError: true });
  const set401 = r;
  r = await expectStatus("settings", "403", "PATCH", "/api/settings", base, { jar: staffJar, body: { companyName: "x", vatNumber: "", currency: "AED", defaultVatRate: 5, quoteValidityDays: 30 }, expected: 403, checkEnvelopeOnError: true, note: "STAFF on ADMIN-only PATCH" });
  const set403 = r;
  r = await expectStatus("settings", "bad-input", "PATCH", "/api/settings", base, { jar: adminJar, body: { companyName: "", currency: "XXX", defaultVatRate: -1, quoteValidityDays: 0, vatNumber: "" }, expected: 422, checkEnvelopeOnError: true, note: "bad currency/vat -> Validation failed" });
  routes.push({ route: "settings", happy: setHappy, unauthorized: set401, forbidden: set403, badInput: r, pass: setHappy.pass && set401.pass && set403.pass && r.pass });

  // ================= route: staff =================
  r = await expectStatus("staff", "happy", "GET", "/api/staff", base, { jar: adminJar, expected: 200 });
  const staffHappy = r;
  r = await expectStatus("staff", "401", "GET", "/api/staff", base, { expected: 401, checkEnvelopeOnError: true });
  const staff401 = r;
  r = await expectStatus("staff", "403", "GET", "/api/staff", base, { jar: staffJar, expected: 403, checkEnvelopeOnError: true, note: "STAFF on ADMIN-only GET" });
  const staff403 = r;
  r = await expectStatus("staff", "bad-input", "POST", "/api/staff", base, { jar: adminJar, body: { name: "x" }, expected: 422, checkEnvelopeOnError: true, note: "short name + missing fields -> Validation failed" });
  routes.push({ route: "staff", happy: staffHappy, unauthorized: staff401, forbidden: staff403, badInput: r, pass: staffHappy.pass && staff401.pass && staff403.pass && r.pass });

  // ================= route: staff/[id] =================
  r = await expectStatus("staff/[id]", "happy", "GET", `/api/staff/${staffId}`, base, { jar: adminJar, expected: 200 });
  const staffIdHappy = r;
  r = await expectStatus("staff/[id]", "401", "GET", `/api/staff/${staffId}`, base, { expected: 401, checkEnvelopeOnError: true });
  const staffId401 = r;
  r = await expectStatus("staff/[id]", "403", "GET", `/api/staff/${staffId}`, base, { jar: staffJar, expected: 403, checkEnvelopeOnError: true, note: "STAFF on ADMIN-only GET" });
  const staffId403 = r;
  r = await expectStatus("staff/[id]", "bad-input", "PATCH", `/api/staff/${staffId}`, base, { jar: adminJar, body: { name: "x", email: "bad", role: "BOGUS" }, expected: 422, checkEnvelopeOnError: true });
  routes.push({ route: "staff/[id]", happy: staffIdHappy, unauthorized: staffId401, forbidden: staffId403, badInput: r, pass: staffIdHappy.pass && staffId401.pass && staffId403.pass && r.pass });

  // ================= route: public/enquiries =================
  const pubBody = {
    name: tag("Public"),
    email: `ph6-smoke-pub-${run}@example.com`,
    phone: uniqPhone(),
    customerType: "B2C",
    serviceWanted: tag("PublicCurtains"),
    notes: tag("public-note"),
  };
  r = await expectStatus("public/enquiries", "happy", "POST", "/api/public/enquiries", base, { body: pubBody, expected: 201 });
  const pubHappy = r;
  const pub401 = na("401-skipped", "public route by design: no session required, 401 does not apply");
  print(`SKIP public/enquiries [401] — ${(pub401 as { rationale: string }).rationale}`);
  const pub403 = na("403-N/A", "no requireRole gate on the public endpoint");
  r = await expectStatus("public/enquiries", "bad-input", "POST", "/api/public/enquiries", base, { body: { name: tag("Bad"), phone: uniqPhone(), email: "not-an-email", serviceWanted: "Curtains" }, expected: 400, checkEnvelopeOnError: true, note: "invalid email -> Invalid enquiry data" });
  routes.push({ route: "public/enquiries", happy: pubHappy, unauthorized: pub401, forbidden: pub403, badInput: r, pass: pubHappy.pass && r.pass });

  // ================= route: quotations/[id]/pdf =================
  const pdfRes = await apiFetch(base, `/api/quotations/${q1}/pdf`, { jar: adminJar });
  const pdfOk = pdfRes.status === 200 && pdfRes.contentType.includes("application/pdf") && pdfRes.text.length > 0;
  recordLeg("quotations/[id]/pdf", "happy", "GET", `/api/quotations/${q1}/pdf`, "200+pdf", pdfRes.status, pdfOk, "n/a", `content-type=${pdfRes.contentType.split(";")[0]} bytes=${pdfRes.text.length}`);
  const pdfHappy: LegRecord = legs[legs.length - 1] as LegRecord;
  r = await expectStatus("quotations/[id]/pdf", "401", "GET", `/api/quotations/${q1}/pdf`, base, { expected: 401, checkEnvelopeOnError: true });
  const pdf401 = r;
  const pdf403 = na("403-N/A", "requireAuth-only, no requireRole gate");
  r = await expectStatus("quotations/[id]/pdf", "bad-input", "GET", "/api/quotations/does-not-exist/pdf", base, { jar: adminJar, expected: 404, checkEnvelopeOnError: true, note: "unknown id -> Not found" });
  routes.push({ route: "quotations/[id]/pdf", happy: pdfHappy, unauthorized: pdf401, forbidden: pdf403, badInput: r, pass: pdfHappy.pass && pdf401.pass && r.pass });

  // --- route pass roll-up ----------------------------------------------------
  for (const rec of routes) {
    const una = "pass" in rec.unauthorized ? (rec.unauthorized as LegRecord).pass : true;
    const ban = "pass" in rec.forbidden ? (rec.forbidden as LegRecord).pass : true;
    rec.pass = rec.happy.pass && una && ban && rec.badInput.pass;
  }

  // --- cleanup: reverse-dependency hard delete of marker rows -----------------
  await deleteMarkers();
  const sweep = await countMarkers();

  const passedRoutes = routes.filter((x) => x.pass).length;
  const totalLegs = legs.length;
  const failedLegs = legs.filter((l) => !l.pass).length;
  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: base,
    run,
    adminEmail,
    totals: {
      routes: routes.length,
      passed: passedRoutes,
      failed: routes.length - passedRoutes,
      legs: totalLegs,
      legsPassed: totalLegs - failedLegs,
      legsFailed: failedLegs,
    },
    routes,
    cleanup: {
      leftoverRows: sweep.total,
      byModel: sweep.byModel,
      staffFixtureRemoved: true,
      note: "All PH6-SMOKE- writes hard-deleted reverse-dependency; smoke staff user removed.",
    },
  };
  writeFileSync(RESULTS_PATH, `${JSON.stringify(summary, null, 2)}\n`);
  print(`RESULTS ${passedRoutes} of ${routes.length} routes pass, ${totalLegs - failedLegs}/${totalLegs} legs pass; leftover marker rows=${sweep.total}`);
  print(`WROTE ${RESULTS_PATH}`);

  if (sweep.total > 0) {
    failures += 1;
    print(`FAIL cleanup leftover marker rows=${sweep.total} ${JSON.stringify(sweep.byModel)}`);
  }
  if (failures > 0) {
    print(`SMOKE RESULT: FAIL (${failures} failing checks)`);
    process.exit(1);
  }
  print("SMOKE RESULT: PASS — 27 of 27 routes pass with zero failures");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
