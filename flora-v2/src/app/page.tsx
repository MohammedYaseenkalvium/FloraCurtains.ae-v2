import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F5F2] flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Flora" width={80} height={24} />
          <span className="text-xl font-bold text-[#5A0E12] tracking-widest">FLORA</span>
        </div>
        <Link 
          href="/login" 
          className="bg-[#5A0E12] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-[#7A1E22] transition-colors"
        >
          Staff Login →
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-extrabold text-[#1A1A1A] tracking-tight mb-6 leading-tight">
            Flora Curtains<br />
            <span className="text-[#5A0E12]">Simplified.</span>
          </h1>
          <p className="text-lg text-[#6B625A] mb-10 leading-relaxed">
  Transforming spaces with style, comfort & elegance since 1997. 
  Premium curtains, upholstery, flooring & complete interior solutions 
  for villas, apartments, offices & commercial spaces across the UAE.
</p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-[#5A0E12] text-white rounded-xl px-8 py-3.5 text-sm font-medium hover:bg-[#7A1E22] transition-colors shadow-sm"
            >
              Access CRM Dashboard
            </Link>
            <a 
              href="mailto:info@flora.ae" 
              className="bg-white border border-[#D8C9BC] text-[#1A1A1A] rounded-xl px-8 py-3.5 text-sm font-medium hover:bg-[#EFE7DF] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-xs text-[#6B625A]">
  © 2026 Flora Curtains LLC · Murur Road, Opp. Mubadala Tower, Abu Dhabi, UAE · P.O Box 25766
</footer>
    </div>
  );
}