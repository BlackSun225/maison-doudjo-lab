import type { Metadata } from "next";
import { Italiana, Instrument_Sans } from "next/font/google";
import "./fd.css";

const display = Italiana({ subsets: ["latin"], weight: "400", variable: "--fd-display", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--fd-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Maison DOUDJO | parfums de niche",
  description: "Parfums de niche composés entre l'Europe, l'Arabie et l'Afrique, dans des flacons dessinés pour chaque histoire.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`fd ${display.variable} ${sans.variable}`}>{children}</div>;
}
