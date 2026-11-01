// Lab index: one brief, built one skill at a time.
const variants = [
  { href: "/v/frontend-design", skill: "frontend-design", read: "Mist and indigo, accent taken from the juice in front of you. One glass bottle morphs from flacon to flacon as you scroll, refracting each perfume's name." },
  { href: "/v/gpt-taste", skill: "gpt-taste", read: "Pearl / ebony with Baoulé gold. Editorial split hero with a live bottle and studio renders inline in the headline, gapless bento, accordion, word-by-word scroll reveal, stacking cards, bottle carousel." },
  { href: "/v/design-taste", skill: "design-taste-frontend", read: "Forest palette (bone / deep green, amber accent), Syne + Outfit. Curtain hero opening onto a 3D shelf of the five flacons, horizontal pan, split-screen Senoufo / Baoulé heritage, 5-cell bento." },
  { href: "/v/high-end", skill: "high-end-visual-design", read: "Ethereal Glass: OLED black / milk-glass white, Unbounded light. Three glowing essences spiral into an empty flacon and fill it on scroll, double-bezel bento collection with glass modals, island nav." },
];

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16 font-sans text-zinc-900">
      <h1 className="text-3xl font-semibold tracking-tight">Maison DOUDJO, design lab</h1>
      <p className="mt-3 max-w-[65ch] text-zinc-600">
        Same brief and content, one landing page per art-direction skill: frontend-design, then gpt-taste,
        design-taste-frontend and high-end-visual-design.
      </p>
      <ol className="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
        {variants.map((v) => (
          <li key={v.href}>
            <a href={v.href} className="block py-5 transition-colors hover:bg-zinc-50">
              <span className="font-mono text-[15px] font-semibold">{v.skill}</span>
              <span className="mt-1 block text-sm text-zinc-600">{v.read}</span>
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
