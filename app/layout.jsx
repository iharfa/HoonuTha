import "./globals.css";
import { Baloo_2, Nunito } from "next/font/google";
import Nav from "@/components/Nav";
import PWA from "@/components/PWA";
import { SvgDefs, DetectiveSun } from "@/components/Art";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-baloo" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito" });

const OG_DESCRIPTION =
  "Hoonu Tha (Dhivehi for “is it hot?”) is a citizen-science app for kids to measure the temperature of their islands — sand, roads, pavers, playgrounds and paint — and learn how trees, shade and colour keep them cool.";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Hoonu Tha — island heat citizen science",
  description: OG_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Hoonu Tha", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: {
    title: "Hoonu Tha — island heat citizen science",
    description: OG_DESCRIPTION,
    type: "website",
    siteName: "Hoonu Tha",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hoonu Tha — Detective Sun mascot and the tagline 'measure the temperature of your island, and learn how to keep it cool'." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoonu Tha — island heat citizen science",
    description: OG_DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport = {
  themeColor: "#e0632f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="mx-auto min-h-dvh max-w-2xl overflow-x-clip pb-28 antialiased">
        <SvgDefs />
        <header className="sticky top-0 z-30 border-b-2 border-[var(--color-ink)] bg-[color-mix(in_oklch,var(--color-paper)_82%,transparent)] backdrop-blur">
          <div className="flex items-center gap-2.5 px-4 py-2.5">
            <DetectiveSun size={40} />
            <div>
              <div className="font-display text-[17px] font-extrabold leading-none text-[var(--color-ink)]">Hoonu Tha</div>
              <div className="mt-0.5 text-[11px] font-semibold leading-none text-[var(--color-ink-2)]">Measure your island. Keep it cool.</div>
            </div>
          </div>
        </header>
        <main className="px-4">{children}</main>
        <Nav />
        <PWA />
      </body>
    </html>
  );
}
