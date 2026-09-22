import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Flora Curtains | Custom Curtains & Interiors, Abu Dhabi",
  description:
    "Flora Curtains LLC — custom curtains, blinds, wallpaper, sofas, flooring and interior decoration across the UAE. Transforming Spaces with Style, Comfort & Elegance.",
};

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