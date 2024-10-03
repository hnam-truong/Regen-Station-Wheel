import type { Metadata } from "next";
import "./globals.css";
import { BackgroundBeams } from "@/components/ui/background-beams";

export const metadata: Metadata = {
  title: "Regen Station Wheel",
  description: "Regen Station lucky wheel spinner",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-neutral-950">
        <div className="bg-neutral-950 relative antialiased">
          <div className="relative z-10">{children}</div>
          <BackgroundBeams />
        </div>
      </body>
    </html>
  );
}
