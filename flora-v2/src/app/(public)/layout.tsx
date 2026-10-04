import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-flora-primary"
      >
        Skip to content
      </a>
      <PublicHeader />

      <main id="main">{children}</main>

      <PublicFooter />
    </div>
  );
}