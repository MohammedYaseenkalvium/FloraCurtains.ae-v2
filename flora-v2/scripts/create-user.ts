/**
 * Creates or updates a user (idempotent upsert).
 *
 * Usage:
 *   npx ts-node scripts/create-user.ts --email a@b.com --name "Jane" --password "secret" --role ADMIN
 *
 * If --password is omitted you'll be prompted (input is hidden).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";

const prisma = new PrismaClient();

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, "");
    const value = argv[i + 1];
    if (key && value !== undefined) out[key] = value;
  }
  return out;
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const stdout = process.stdout as NodeJS.WriteStream & { _write?: unknown };
    const original = stdout.write.bind(stdout);
    // Mask typed characters.
    (stdout as unknown as { write: (s: string) => boolean }).write = (chunk: string) => {
      if (chunk.includes("\n") || chunk === question) return original(chunk);
      return true;
    };
    rl.question(question, (answer) => {
      (stdout as unknown as { write: typeof original }).write = original;
      original("\n");
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = args.email?.toLowerCase();
  const name = args.name;
  const role = args.role ?? "STAFF";

  if (!email || !name) {
    console.error('Required: --email <email> --name "<name>" [--role ADMIN|STAFF] [--password <pw>]');
    process.exit(1);
  }

  const password = args.password ?? (await promptHidden("Password: "));
  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role, password: hashed },
    create: { email, name, role, password: hashed },
  });

  console.log(`User ready: ${user.email} (${user.role})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
