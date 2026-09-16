import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "FloraFlow | Interior Operations",
  description: "Flora Curtains CRM and Interior Operations Portal",
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