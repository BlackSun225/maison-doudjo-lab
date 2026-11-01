import type { Metadata } from "next";
import { Syne, Outfit } from "next/font/google";
import "./dt.css";

// Syne was drawn for an art centre: a display face for a perfumer who calls himself an artist.
const display = Syne({ subsets: ["latin"], variable: "--dt-display", weight: ["500", "600", "700"], display: "swap" });
const sans = Outfit({ subsets: ["latin"], variable: "--dt-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Maison DOUDJO | design-taste-frontend",
  description: "Parfums de niche composés entre l'Europe, l'Arabie et l'Afrique.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`dt dt-grain ${display.variable} ${sans.variable}`}>{children}</div>;
}
