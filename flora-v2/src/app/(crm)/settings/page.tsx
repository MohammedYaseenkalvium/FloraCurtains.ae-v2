"use client";

import { useState, useEffect } from "react";

type Settings = {
  companyName: string;
  vatNumber: string;
  currency: string;
  defaultVatRate: number;
  quoteValidityDays: number;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(setSettings);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setLoading(false);
  }

  const field = "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";
  const label = "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

  if (!settings) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Settings</h1>
      <p className="text-[#6B625A] text-sm mb-8">Manage your company profile and preferences</p>

      <form onSubmit={handleSave} className="space-y-8">
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
        </div>
      </form>
    </div>
  );
}