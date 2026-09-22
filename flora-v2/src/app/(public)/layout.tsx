import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-flora-background text-flora-foreground">
      <PublicHeader />

      <main>{children}</main>

      <PublicFooter />
    </div>
  );
}