"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("Flora Interior Operations");
  const [vatNumber, setVatNumber] = useState("100000000000003");
  const [currency, setCurrency] = useState("AED");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const field = "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";
  const label = "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

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
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>VAT / TRN Number</label>
              <input value={vatNumber} onChange={e => setVatNumber(e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>Default Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={field}>
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
              <input type="number" defaultValue={5} className={field} />
            </div>
            <div>
              <label className={label}>Quote Validity (days)</label>
              <input type="number" defaultValue={30} className={field} />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-[#5A0E12] text-white rounded-lg px-8 py-2.5 text-sm font-medium hover:bg-[#7A1E22] transition-colors"
          >
            Save Changes
          </button>
          {saved && <span className="text-sm text-[#0F6E56]">✓ Saved successfully</span>}
        </div>
      </form>
    </div>
  );
}