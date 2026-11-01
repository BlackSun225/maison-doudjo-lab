import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./gt.css";

const geist = Geist({ subsets: ["latin"], variable: "--gt-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Maison DOUDJO | gpt-taste",
  description: "Parfums de niche composés entre l'Europe, l'Arabie et l'Afrique.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`gt gt-grain ${geist.variable}`}>{children}</div>;
}
