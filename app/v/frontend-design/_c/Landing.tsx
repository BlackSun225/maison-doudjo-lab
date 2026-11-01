"use client";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Moon, Sun } from "@phosphor-icons/react";
import { brand, materials, order, perfumer, perfumes, ui, type Lang, type T } from "@/lib/content";
import { bottlePath } from "@/lib/bottle3d";
import { useLang } from "@/lib/useLang";
import { useTheme } from "@/lib/useTheme";
import { gsap, ScrollTrigger, scrollToTarget, startSmoothScroll } from "@/lib/smooth";
import Atelier3D, { chapterAt } from "./Atelier3D";

const CHAPTERS = 6; // hero + 5 perfumes, one viewport each

/* ------------------------------------------------------------------ collection */
function Collection({ t, lang, theme, active, setActive }: { t: (x: T) => string; lang: Lang; theme: "light" | "dark"; active: number; setActive: (i: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const st = useRef<ScrollTrigger | null>(null);

  useGSAP(() => {
    st.current = ScrollTrigger.create({
      trigger: ref.current, start: "top top", end: "bottom bottom",
      onUpdate: (s) => {
        progress.current = s.progress;
        const c = chapterAt(s.progress);
        setActive(c.hero ? -1 : c.active);
      },
    });
    return () => st.current?.kill();
  }, { scope: ref });

  const goTo = (i: number) => {
    const s = st.current;
    if (!s) return;
    scrollToTarget(s.start + ((s.end - s.start) * (i + 1.35)) / CHAPTERS);
  };
  const p = active >= 0 ? perfumes[active] : null;

  return (
    <section id="collection" ref={ref} style={{ height: `${CHAPTERS * 100 + 40}vh` }} className="relative">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <Atelier3D
          progress={progress}
          theme={theme}
          label={p ? p.name : brand.name}
          ariaLabel={p ? `${p.name}: ${t(p.bottleNote)}` : t(brand.heroLine)}
          className="absolute inset-0"
        />
        <h1 className="sr-only">{brand.name}</h1>

        {/* hero copy: bottom band, never over the bottle */}
        <div
          className={`absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] flex-col gap-6 px-6 pb-10 transition-all duration-700 md:flex-row md:items-end md:justify-between md:px-12 md:pb-14 ${p ? "pointer-events-none translate-y-6 opacity-0" : "opacity-100"}`}
        >
          <p className="max-w-[30ch] text-lg leading-snug md:text-xl">{t(brand.heroLine)}</p>
          <div className="flex flex-wrap gap-3">
            <button className="fd-btn fd-btn--fill" onClick={() => goTo(0)}>{t(brand.ctaCollection)}</button>
            <button className="fd-btn fd-btn--line" onClick={() => scrollToTarget("#coffret")}>{t(brand.ctaSet)}</button>
          </div>
        </div>

        {/* chapter copy: story left, notes right, the bottle owns the centre */}
        {perfumes.map((q, i) => {
          const on = i === active;
          return (
            <article
              key={q.id}
              aria-hidden={!on}
              className={`pointer-events-none absolute inset-0 mx-auto grid max-w-[1440px] grid-rows-[1fr_auto] px-6 pb-8 pt-24 transition-opacity duration-700 md:grid-cols-12 md:grid-rows-1 md:items-center md:px-12 md:py-0 ${on ? "opacity-100" : "opacity-0"}`}
            >
              <div className={`row-start-2 transition-transform duration-700 md:col-span-4 md:row-start-1 ${on ? "translate-y-0" : "translate-y-8"}`}>
                <h2 className="fd-display fd-d3">{q.name}</h2>
                <p className="mt-3 text-sm" style={{ color: "var(--juice)" }}>
                  {t(q.family)}, {q.traditions.map((x) => t(ui.traditions[x])).join(lang === "fr" ? " et " : " and ")}
                </p>
                <p className="mt-5 hidden max-w-[42ch] leading-relaxed text-[var(--ink-soft)] sm:block">{t(q.story)}</p>
              </div>
              <div className={`hidden transition-transform delay-100 duration-700 md:col-span-3 md:col-start-9 md:block xl:col-start-8 ${on ? "translate-y-0" : "translate-y-8"}`}>
                <ol className="space-y-5">
                  {(["top", "heart", "base"] as const).map((k) => (
                    <li key={k} className="border-t border-[var(--line)] pt-3">
                      <p className="fd-small">{t(ui[k])}</p>
                      <p className="mt-1 text-[17px]">{t(q.notes[k])}</p>
                    </li>
                  ))}
                </ol>
                <p className="fd-small mt-8 max-w-[34ch]">{t(q.bottleNote)}</p>
              </div>
            </article>
          );
        })}

        {/* collection index: a real navigation, not decoration */}
        <nav aria-label={t({ fr: "Parfums de la collection", en: "Perfumes in the collection" })} className="absolute right-6 top-1/2 hidden -translate-y-1/2 xl:block">
          <ul className="space-y-2 text-right">
            {perfumes.map((q, i) => (
              <li key={q.id}>
                <button onClick={() => goTo(i)} aria-current={i === active} className={`text-sm transition-colors duration-300 ${i === active ? "text-[var(--ink)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"}`}>
                  {q.name}
                  <span className="ml-2 inline-block h-px align-middle transition-all duration-500" style={{ width: i === active ? 24 : 8, background: i === active ? "var(--juice)" : "var(--line)" }} />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ perfumer */
function Perfumer({ t, lang }: { t: (x: T) => string; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>(".fd-line").forEach((line) => {
        gsap.fromTo(line, { opacity: 0.12 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: line, start: "top 85%", end: "top 45%", scrub: true } });
      });
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [lang] });

  return (
    <section id="parfumeur" ref={ref} className="mx-auto max-w-[1440px] px-6 py-32 md:px-12 md:py-48">
      <h2 className="fd-display fd-d2">{t(perfumer.title)}</h2>
      <p className="mt-8 max-w-[56ch] text-lg leading-relaxed text-[var(--ink-soft)]">{t(perfumer.intro)}</p>
      <div className="mt-16 grid gap-12 border-t border-[var(--line)] pt-12 md:grid-cols-2">
        {[perfumer.father, perfumer.mother].map((x) => (
          <div key={x.title.en}>
            <h3 className="fd-display text-3xl">{t(x.title)}</h3>
            <p className="mt-4 max-w-[44ch] leading-relaxed text-[var(--ink-soft)]">{t(x.text)}</p>
          </div>
        ))}
      </div>
      <blockquote className="mt-28 max-w-[30ch] md:ml-[16.66%]">
        {perfumer.statement[lang].map((l, i) => (
          <span key={`${lang}-${i}`} className="fd-line fd-display fd-d3 block">{l}</span>
        ))}
      </blockquote>
    </section>
  );
}

/* ------------------------------------------------------------------ materials */
function Materials({ t }: { t: (x: T) => string }) {
  return (
    <section id="matieres" className="border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-36">
        <h2 className="fd-display fd-d2 max-w-[14ch]">{t({ fr: "Trois traditions, une palette", en: "Three traditions, one palette" })}</h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {materials.map((m) => (
            <div key={m.tradition}>
              <h3 className="fd-display text-4xl">{t(ui.traditions[m.tradition])}</h3>
              <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {m.items.map((it) => (
                  <li key={it.name.en} className="flex items-baseline justify-between gap-4 py-4">
                    <span className="text-lg">{t(it.name)}</span>
                    <span className="fd-small text-right">{t(it.place)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ bottles */
function Bottles({ t, theme, onPick }: { t: (x: T) => string; theme: "light" | "dark"; onPick: (i: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<SVGPathElement>(".fd-trace").forEach((p) => {
        const len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 75%", end: "center 55%", scrub: true },
        });
      });
      gsap.fromTo(".fd-fill", { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "center 65%", end: "center 45%", scrub: true } });
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <section id="flacons" ref={ref} className="mx-auto max-w-[1440px] px-6 py-32 md:px-12 md:py-44">
      <h2 className="fd-display fd-d2">{t({ fr: "Cinq flacons, dessinés à la main", en: "Five bottles, drawn by hand" })}</h2>
      <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-[var(--ink-soft)]">
        {t({ fr: "Chaque flacon prend la forme de son histoire. Choisissez-en un pour le retrouver dans la collection.", en: "Each bottle takes the shape of its story. Pick one to see it again in the collection." })}
      </p>
      <ul className="mt-20 grid grid-cols-2 items-end gap-x-6 gap-y-16 sm:grid-cols-3 lg:grid-cols-5">
        {perfumes.map((q, i) => {
          const s = bottlePath(q.bottle);
          const juice = theme === "dark" ? q.juiceDark : q.juice;
          const pad = 12;
          return (
            <li key={q.id}>
              <button onClick={() => onPick(i)} className="group block w-full text-left">
                <svg viewBox={`${-s.width / 2 - pad} ${-s.height - pad} ${s.width + pad * 2} ${s.height + pad * 2}`} className="mx-auto h-56 w-auto overflow-visible transition-transform duration-500 group-hover:-translate-y-2" aria-hidden>
                  <path className="fd-fill" d={s.body} fill={juice} fillOpacity={0.22} />
                  <path className="fd-fill" d={s.cap} fill={q.bottle.cap.color} />
                  <path className="fd-trace" d={s.body} fill="none" stroke="var(--ink)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
                  <path className="fd-trace" d={s.cap} fill="none" stroke="var(--ink)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="mt-6 block text-center fd-display text-2xl transition-colors duration-300 group-hover:text-[var(--juice)]" style={{ ["--juice" as string]: juice }}>
                  {q.name}
                </span>
                <span className="fd-small mt-1 block text-center">{t(q.family)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ order */
function Order({ t }: { t: (x: T) => string }) {
  const [choice, setChoice] = useState<"set" | "visit">("set");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "sending" | "done">("idle");
  const valid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid(email)) return setState("error");
    setState("sending");
    setTimeout(() => setState("done"), 1000); // prototype: no backend
  };
  return (
    <section id="coffret" className="border-t border-[var(--line)]">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 py-32 md:grid-cols-12 md:px-12 md:py-44">
        <div className="md:col-span-6">
          <h2 className="fd-display fd-d2">{t(order.title)}</h2>
          <p className="mt-8 max-w-[48ch] text-lg leading-relaxed text-[var(--ink-soft)]">{t(order.text)}</p>
        </div>
        <form onSubmit={submit} noValidate className="flex flex-col gap-6 md:col-span-5 md:col-start-8 md:self-end">
          {state === "done" ? (
            <p role="status" className="fd-display text-3xl">{t(order.sent)}</p>
          ) : (
            <>
              <fieldset>
                <legend className="mb-3 text-sm font-medium">{t(order.choiceLabel)}</legend>
                <div className="grid gap-2">
                  {(["set", "visit"] as const).map((c) => (
                    <label key={c} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors ${choice === c ? "bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--ink)]" : "shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--ink-soft)]"}`}>
                      <input type="radio" name="choice" value={c} checked={choice === c} onChange={() => setChoice(c)} className="h-4 w-4 accent-[var(--ink)]" />
                      {t(c === "set" ? order.choiceSet : order.choiceVisit)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-col gap-2">
                <label htmlFor="fd-email" className="text-sm font-medium">{t(order.emailLabel)}</label>
                <input
                  id="fd-email" type="email" autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                  onBlur={() => { if (email && !valid(email)) setState("error"); }}
                  aria-invalid={state === "error"} aria-describedby="fd-help fd-err"
                  className={`h-14 rounded-2xl bg-transparent px-4 text-lg outline-none transition-shadow ${state === "error" ? "shadow-[inset_0_0_0_1.5px_#c2410c]" : "shadow-[inset_0_0_0_1px_var(--line)] focus:shadow-[inset_0_0_0_1.5px_var(--ink)]"}`}
                />
                <p id="fd-help" className="fd-small">{t(order.emailHelp)}</p>
                {state === "error" && <p id="fd-err" role="alert" className="text-sm text-[#c2410c]">{t(order.emailError)}</p>}
              </div>
              <button type="submit" disabled={state === "sending"} className="fd-btn fd-btn--fill self-start disabled:opacity-60">
                {state === "sending" ? t(order.sending) : t(choice === "set" ? brand.ctaSet : { fr: "Demander un rendez-vous", en: "Request an appointment" })}
              </button>
            </>
          )}
        </form>
      </div>
      <footer className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 border-t border-[var(--line)] px-6 py-8 md:flex-row md:px-12">
        <p className="fd-display text-2xl">{brand.name}</p>
        <p className="fd-small">{t({ fr: "Atelier à Abidjan. Expédition en Europe, en Afrique et dans le Golfe.", en: "Atelier in Abidjan. Shipping to Europe, Africa and the Gulf." })}</p>
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------------ page */
export default function Landing() {
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const [lastPerfume, setLast] = useState(0);
  useEffect(() => startSmoothScroll(0.085), []);
  useEffect(() => { if (active >= 0) setLast(active); }, [active]);

  // the page takes the colour of the juice in front of you
  useEffect(() => {
    const p = perfumes[lastPerfume];
    rootRef.current?.closest<HTMLElement>(".fd")?.style.setProperty("--juice", theme === "dark" ? p.juiceDark : p.juice);
  }, [lastPerfume, theme]);

  const pick = (i: number) => {
    const el = document.getElementById("collection")!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToTarget(top + ((el.offsetHeight - window.innerHeight) * (i + 1.35)) / CHAPTERS, 2);
  };

  const links = [
    { href: "#collection", label: { fr: "Collection", en: "Collection" } },
    { href: "#parfumeur", label: perfumer.title },
    { href: "#matieres", label: { fr: "Matières", en: "Materials" } },
    { href: "#coffret", label: { fr: "Coffret", en: "Discovery set" } },
  ];

  return (
    <div ref={rootRef}>
      <header className="fixed inset-x-0 top-0 z-30 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md transition-colors duration-500">
        <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:px-12">
          <button onClick={() => scrollToTarget(0)} className="fd-display text-2xl tracking-wide">{brand.name}</button>
          <ul className="hidden items-center gap-8 text-[15px] lg:flex">
            {links.map((l) => (
              <li key={l.href}><button onClick={() => scrollToTarget(l.href)} className="fd-link">{t(l.label)}</button></li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Langue / Language" className="flex rounded-full p-1 shadow-[inset_0_0_0_1px_var(--line)]">
              {(["fr", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                  className={`h-8 w-9 rounded-full text-xs font-semibold uppercase transition-colors ${lang === l ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"}`}>
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`${t(ui.theme)}: ${t(theme === "dark" ? ui.light : ui.dark)}`}
              className="grid h-10 w-10 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:shadow-[inset_0_0_0_1px_var(--ink)]"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>
      </header>
      <main>
        <Collection t={t} lang={lang} theme={theme} active={active} setActive={setActive} />
        <Perfumer t={t} lang={lang} />
        <Materials t={t} />
        <Bottles t={t} theme={theme} onPick={pick} />
        <Order t={t} />
      </main>
    </div>
  );
}
