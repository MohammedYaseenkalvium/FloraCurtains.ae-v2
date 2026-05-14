import { EnquiryForm } from "@/components/crm/EnquiryForm";

export default function NewEnquiryPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Log New Enquiry</h1>
      <p className="text-[#6B625A] text-sm mb-8">Record a call, walk-in, or referral</p>
      <EnquiryForm />
    </div>
  );
}