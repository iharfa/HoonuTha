import "./globals.css";
import { Baloo_2, Nunito } from "next/font/google";
import Nav from "@/components/Nav";
import PWA from "@/components/PWA";
import { SvgDefs, DetectiveSun } from "@/components/Art";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-baloo" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito" });

const OG_DESCRIPTION =
  "A citizen-science app where kids in the Maldives measure how hot different surfaces get — sand, asphalt, pavers, playgrounds and road paint — then discover the Urban Heat Island effect, albedo, and how trees keep our islands cool.";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Heat Detectives — Maldives surface science",
  description: OG_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Heat Detectives", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: {
    title: "Heat Detectives — Maldives surface science",
    description: OG_DESCRIPTION,
    type: "website",
    siteName: "Heat Detectives",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Heat Detectives — Detective Sun and the tagline 'measure how hot our streets get, and how to cool our islands'." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Heat Detectives — Maldives surface science",
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
              <div className="font-display text-[17px] font-extrabold leading-none text-[var(--color-ink)]">Heat Detectives</div>
              <div className="mt-0.5 text-[11px] font-semibold leading-none text-[var(--color-ink-2)]">Measure the heat. Cool your island.</div>
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
