import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#1E1B18]">
      <PublicHeader />

      <main>{children}</main>

      <PublicFooter />
    </div>
  );
}