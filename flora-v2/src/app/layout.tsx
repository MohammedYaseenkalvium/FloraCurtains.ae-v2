import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://floracurtains.ae"),
  title: {
    default: "Flora Curtains LLC | Curtains & Interior Solutions in Abu Dhabi",
    template: "%s | Flora Curtains LLC",
  },
  description:
    "Flora Curtains LLC — custom curtains, blinds, wallpaper, sofas, flooring and interior decoration across the UAE. Transforming Spaces with Style, Comfort & Elegance.",
  openGraph: {
    type: "website",
    siteName: "Flora Curtains LLC",
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}