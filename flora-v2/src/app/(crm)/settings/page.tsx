"use client";

import { useState, useEffect } from "react";

type Settings = {
  companyName: string;
  vatNumber: string;
  currency: string;
  defaultVatRate: number;
  quoteValidityDays: number;
};

/** Maps an API error envelope to a message a staff member can act on. */
async function apiErrorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  if (body && typeof body === "object") {
    const { error, details } = body as { error?: unknown; details?: unknown };
    if (typeof error === "string" && error) {
      if (res.status === 422 && details && typeof details === "object") {
        const first = Object.values(details as Record<string, string[]>)[0]?.[0];
        return first ? `${error}: ${first}` : error;
      }
      if (res.status === 403) return `${error} — an administrator is required to change settings.`;
      if (res.status === 401) return "Your session has expired. Sign in again to continue.";
      return error;
    }
  }
  return `Unable to save settings (HTTP ${res.status}).`;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Bumped by the retry button to re-run the load effect.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error(await apiErrorMessage(res));
        return (await res.json()) as Settings;
      })
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error && err.message
            ? err.message
            : "Unable to load settings. Check your connection and try again."
        );
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  /** Clears the stale result, then re-runs the load effect. */
  function retryLoad() {
    setLoadError(null);
    setSettings(null);
    setReloadKey((k) => k + 1);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        setSaveError(await apiErrorMessage(res));
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Unable to save settings. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const field = "border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-flora-surface w-full";
  const label = "text-[10px] uppercase tracking-widest text-flora-muted block mb-1";

  if (loadError) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">Settings</h1>
        <div
          role="alert"
          className="mt-6 rounded-lg border border-flora-danger/40 bg-flora-danger-surface p-6"
        >
          <p className="text-sm font-medium text-flora-danger mb-4">{loadError}</p>
          <button
            type="button"
            onClick={retryLoad}
            className="rounded-lg border border-flora-border bg-white px-4 py-2 text-sm font-medium hover:border-flora-primary transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!settings) return <div className="p-8">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Settings</h1>
      <p className="text-flora-muted text-sm mb-8">Manage your company profile and preferences</p>

      <form onSubmit={handleSave} className="space-y-8">
        <section>
          <h3 className="font-semibold text-sm mb-4 text-flora-primary">Company Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Company Name</label>
              <input value={settings.companyName} onChange={e => setSettings(s => s && ({ ...s, companyName: e.target.value }))} className={field} />
            </div>
            <div>
              <label className={label}>VAT / TRN Number</label>
              <input value={settings.vatNumber} onChange={e => setSettings(s => s && ({ ...s, vatNumber: e.target.value }))} className={field} />
            </div>
            <div>
              <label className={label}>Default Currency</label>
              <select value={settings.currency} onChange={e => setSettings(s => s && ({ ...s, currency: e.target.value }))} className={field}>
                <option value="AED">AED — UAE Dirham</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-sm mb-4 text-flora-primary">Quotation Defaults</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Default VAT Rate (%)</label>
              <input type="number" value={settings.defaultVatRate} onChange={e => setSettings(s => s && ({ ...s, defaultVatRate: Number(e.target.value) }))} className={field} />
            </div>
            <div>
              <label className={label}>Quote Validity (days)</label>
              <input type="number" value={settings.quoteValidityDays} onChange={e => setSettings(s => s && ({ ...s, quoteValidityDays: Number(e.target.value) }))} className={field} />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="bg-flora-primary text-white rounded-lg px-8 py-2.5 text-sm font-medium hover:bg-flora-primary-hover disabled:opacity-50 transition-colors">
            {loading ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="text-sm text-flora-success">✓ Saved successfully</span>}
        </div>
        {saveError && (
          <p role="alert" className="text-sm text-flora-danger">
            {saveError}
          </p>
        )}
      </form>
    </div>
  );
}