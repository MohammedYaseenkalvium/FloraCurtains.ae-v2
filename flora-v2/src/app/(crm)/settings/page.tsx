"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type Settings = {
  companyName: string;
  vatNumber: string;
  currency: string;
  defaultVatRate: number;
  quoteValidityDays: number;
};

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(setSettings);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Failed to save changes");
    }
    setLoading(false);
  }

  const field = "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";
  const label = "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

  if (status === "loading" || !settings) return <div className="p-8">Loading...</div>;

  // The API already 403s non-admins; this just avoids showing an editable
  // form (and a confusing failed-save alert) to staff who can't save it.
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Settings</h1>
      <p className="text-[#6B625A] text-sm mb-8">Manage your company profile and preferences</p>

      {!isAdmin && (
        <div className="bg-[#F8F5F2] border border-[#D8C9BC] rounded-lg px-4 py-3 text-sm text-[#6B625A] mb-6">
          Only admins can change company settings. Contact an admin if these need updating.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <fieldset disabled={!isAdmin} className="space-y-8 disabled:opacity-60">
          <section>
            <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Company Profile</h3>
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
            <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Quotation Defaults</h3>
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
            <button type="submit" disabled={loading} className="bg-[#5A0E12] text-white rounded-lg px-8 py-2.5 text-sm font-medium hover:bg-[#7A1E22] disabled:opacity-50 transition-colors">
              {loading ? "Saving…" : "Save Changes"}
            </button>
            {saved && <span className="text-sm text-[#0F6E56]">✓ Saved successfully</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </fieldset>
      </form>
    </div>
  );
}