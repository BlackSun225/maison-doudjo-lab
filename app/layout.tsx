import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maison DOUDJO, design lab",
  description: "One brief, one landing page per art-direction skill.",
};

// Sets data-theme before first paint (saved choice, else system preference) to avoid a light/dark flash.
const themeBoot = `try{var t=localStorage.getItem('doudjo-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
