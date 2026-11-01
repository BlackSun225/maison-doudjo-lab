import type { Metadata } from "next";
import { Unbounded, Plus_Jakarta_Sans } from "next/font/google";
import "./he.css";

const display = Unbounded({ subsets: ["latin"], variable: "--he-display", weight: ["200", "300", "400"], display: "swap" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--he-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Maison DOUDJO | high-end-visual-design",
  description: "Parfums de niche composés entre l'Europe, l'Arabie et l'Afrique.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`he he-grain ${display.variable} ${sans.variable}`}>{children}</div>;
}
