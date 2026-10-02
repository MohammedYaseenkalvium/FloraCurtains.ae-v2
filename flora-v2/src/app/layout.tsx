import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Flora Curtains LLC | Curtains & Interior Solutions in Abu Dhabi",
    template: "%s | Flora Curtains LLC",
  },
  description:
    "Flora Curtains LLC — custom curtains, blinds, wallpaper, sofas, flooring and interior decoration across the UAE. Transforming Spaces with Style, Comfort & Elegance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}