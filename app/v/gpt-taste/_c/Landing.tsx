"use client";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Moon, Sun } from "@phosphor-icons/react";
import { brand, commons, commonsPage, ingredientPhotos, materials, order, perfumer, perfumes, ui, type Lang, type T } from "@/lib/content";
import { useLang } from "@/lib/useLang";
import { useTheme } from "@/lib/useTheme";
import { gsap, ScrollTrigger, scrollToTarget, startSmoothScroll } from "@/lib/smooth";
import { HeroBottle, useBottleShots } from "./Scenes";

type Tf = (x: T) => string;

function Shot({ shots, i, className = "" }: { shots: string[] | null; i: number; className?: string }) {
  return shots ? (
    <img src={shots[i]} alt={`${perfumes[i].name}`} className={`h-full w-full object-cover ${className}`} />
  ) : (
    <span className={`block h-full w-full animate-pulse bg-[var(--line)] ${className}`} />
  );
}

function Btn({ children, gold, onClick, type = "button", disabled }: React.PropsWithChildren<{ gold?: boolean; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex h-14 items-center gap-3 whitespace-nowrap rounded-full px-8 text-[15px] font-medium transition-all duration-500 ease-out active:scale-[0.98] disabled:opacity-60 ${
        gold ? "bg-[var(--gold)] text-[var(--on-gold)] hover:brightness-110" : "bg-[var(--ink)] text-[var(--bg)] hover:opacity-90"
      }`}
    >
      {children}
      <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </button>
  );
}

/* ============================================================ hero: editorial split */
function Hero({ t, lang, theme, shots }: { t: Tf; lang: Lang; theme: string; shots: string[] | null }) {
  const ref = useRef<HTMLElement>(null);
  const tilt = useRef(0);
  const [i, setI] = useState(1);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % perfumes.length), 5200);
    return () => clearInterval(id);
  }, []);
  useGSAP(() => {
    ScrollTrigger.create({ trigger: ref.current, start: "top top", end: "bottom top", onUpdate: (s) => (tilt.current = s.progress) });
    gsap.from(".gt-in", { y: 50, opacity: 0, duration: 1.3, stagger: 0.1, ease: "expo.out", delay: 0.1 });
  }, { scope: ref });

  const pill = (k: number) => (
    <span className="mx-[0.15em] inline-block h-[0.8em] w-[1.75em] overflow-hidden rounded-full align-[-0.08em] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)]">
      <Shot shots={shots} i={k} className="scale-[1.15] object-[50%_42%]" />
    </span>
  );

  return (
    <section ref={ref} className="relative mx-auto grid min-h-[100dvh] max-w-[1440px] grid-cols-1 items-center gap-10 px-5 pt-28 md:grid-cols-12 md:px-12">
      <div className="pointer-events-none absolute -left-40 top-10 h-[560px] w-[560px] rounded-full opacity-40 blur-[140px]" style={{ background: perfumes[i].juice }} aria-hidden />
      <div className="relative md:col-span-7">
        <h1 className="gt-in max-w-5xl text-[clamp(3rem,5vw,5.5rem)] font-light leading-[1.02] tracking-[-0.045em]">
          {lang === "fr" ? <>Trois mondes {pill(2)} dans un flacon {pill(1)}</> : <>Three worlds {pill(2)} in one bottle {pill(1)}</>}
        </h1>
        <p className="gt-in mt-8 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{t(brand.tagline)} {t(brand.heroLine)}</p>
        <div className="gt-in mt-10 flex flex-wrap gap-3">
          <Btn onClick={() => scrollToTarget("#gt-collection")}>{t(brand.ctaCollection)}</Btn>
          <Btn gold onClick={() => scrollToTarget("#gt-action")}>{t(brand.ctaSet)}</Btn>
        </div>
      </div>
      <div className="relative md:col-span-5">
        <HeroBottle index={i} tilt={tilt} theme={theme} label={perfumes[i].name} className="h-[56dvh] w-full [mask-image:radial-gradient(closest-side,#000_62%,transparent)] md:h-[82dvh]" />
        <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-[var(--muted)]" aria-live="polite">
          {perfumes[i].name}
        </p>
      </div>
    </section>
  );
}

/* ============================================================ interest: gapless bento (4 x 3) */
function Bento({ t, shots }: { t: Tf; shots: string[] | null }) {
  const trad = (k: "europe" | "arabie" | "afrique") => materials.find((m) => m.tradition === k)!;
  const Photo = ({ k, span }: { k: "europe" | "arabie" | "afrique"; span: string }) => {
    const ph = ingredientPhotos[k];
    return (
      <article className={`group relative min-h-[300px] overflow-hidden rounded-[2rem] ${span}`}>
        <img src={commons(ph.file, 1200)} alt={t(ph.alt)} loading="lazy" className="absolute inset-0 h-full w-full object-cover contrast-[1.1] saturate-[0.85] transition-transform duration-700 ease-out group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-7 text-white">
          <p className="text-3xl font-light tracking-[-0.03em]">{t(ui.traditions[k])}</p>
          <p className="mt-2 text-sm text-white/80">{trad(k).items.map((it) => `${t(it.name)} (${t(it.place)})`).join(", ")}</p>
        </div>
      </article>
    );
  };
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-32 md:px-12 md:py-48">
      <h2 className="max-w-4xl text-[clamp(2.4rem,4.4vw,4.4rem)] font-light leading-[1.02] tracking-[-0.045em]">
        {t({ fr: "Un parfumeur, deux héritages, trois traditions", en: "One perfumer, two heritages, three traditions" })}
      </h2>
      <div className="mt-16 grid grid-flow-dense grid-cols-1 gap-4 md:auto-rows-[300px] md:grid-cols-4">
        <article className="relative overflow-hidden rounded-[2rem] bg-[var(--surface)] p-8 ring-1 ring-[var(--line)] md:col-span-2 md:row-span-2 md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-50 blur-[90px]" style={{ background: perfumes[1].juice }} />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-40 blur-[90px]" style={{ background: perfumes[0].juice }} />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <p className="max-w-[40ch] text-lg leading-relaxed text-[var(--muted)]">{t(perfumer.intro)}</p>
            <div className="grid gap-8 sm:grid-cols-2">
              {[perfumer.father, perfumer.mother].map((x) => (
                <div key={x.title.en}>
                  <p className="text-2xl font-light tracking-[-0.03em]">{t(x.title)}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">{t(x.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
        <Photo k="europe" span="md:col-span-2" />
        <Photo k="arabie" span="md:col-span-1" />
        <Photo k="afrique" span="md:col-span-1" />
        <article className="grid grid-cols-5 gap-2 overflow-hidden rounded-[2rem] bg-[var(--surface)] p-2 ring-1 ring-[var(--line)] md:col-span-4">
          {perfumes.map((p, k) => (
            <button key={p.id} onClick={() => scrollToTarget(`#gt-card-${p.id}`)} className="group relative overflow-hidden rounded-[1.5rem]" aria-label={p.name}>
              <Shot shots={shots} i={k} className="transition-transform duration-700 ease-out group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-sm text-white">{p.name}</span>
            </button>
          ))}
        </article>
      </div>
    </section>
  );
}

/* ============================================================ interest: horizontal accordion */
function Accordion({ t, shots }: { t: Tf; shots: string[] | null }) {
  const [open, setOpen] = useState(1);
  return (
    <section id="gt-collection" className="mx-auto max-w-[1440px] px-5 pb-32 md:px-12 md:pb-48">
      <h2 className="max-w-4xl text-[clamp(2.4rem,4.4vw,4.4rem)] font-light leading-[1.02] tracking-[-0.045em]">
        {t({ fr: "Cinq parfums, cinq histoires", en: "Five perfumes, five stories" })}
      </h2>
      <div className="mt-16 flex flex-col gap-3 md:h-[620px] md:flex-row">
        {perfumes.map((p, k) => {
          const isOpen = open === k;
          return (
            <button
              key={p.id}
              onMouseEnter={() => setOpen(k)}
              onFocus={() => setOpen(k)}
              onClick={() => setOpen(k)}
              aria-expanded={isOpen}
              className={`group relative overflow-hidden rounded-[2rem] text-left transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:basis-0 ${isOpen ? "min-h-[560px] md:min-h-0 md:grow-[5]" : "min-h-[90px] md:min-h-0 md:grow"}`}
            >
              <Shot shots={shots} i={k} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
              <span className={`absolute inset-0 transition-colors duration-700 ${isOpen ? "bg-gradient-to-r from-black/75 via-black/30 to-transparent" : "bg-black/35"}`} />
              <span className={`absolute left-6 top-6 text-xl text-white transition-opacity duration-300 ${isOpen ? "opacity-0" : "md:left-1/2 md:top-8 md:-translate-x-1/2 md:[writing-mode:vertical-rl]"}`}>{p.name}</span>
              <span className={`absolute inset-y-0 left-0 flex max-w-md flex-col justify-end p-8 text-white transition-all duration-700 md:p-10 ${isOpen ? "translate-y-0 opacity-100 delay-200" : "pointer-events-none translate-y-6 opacity-0"}`}>
                <span className="text-4xl font-light tracking-[-0.04em] md:text-5xl">{p.name}</span>
                <span className="mt-2 text-sm text-white/75">{t(p.family)}</span>
                <span className="mt-6 text-[15px] leading-relaxed text-white/90">{t(p.story)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================ desire: scrubbed word reveal */
function Statement({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const words = perfumer.statement[lang].join(" ").split(" ");
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".gt-word", { opacity: 0.1 }, {
        opacity: 1, stagger: 0.08, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 60%", scrub: true },
      });
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [lang] });
  return (
    <section ref={ref} className="relative overflow-hidden px-5 py-32 md:px-12 md:py-48">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[160px]" style={{ background: `linear-gradient(90deg, ${perfumes[3].juice}, ${perfumes[1].juice}, ${perfumes[4].juice})` }} aria-hidden />
      <p className="relative mx-auto max-w-6xl text-center text-[clamp(2rem,4vw,4rem)] font-light leading-[1.15] tracking-[-0.035em]">
        {words.map((w, k) => <span key={`${lang}-${k}`} className="gt-word">{w} </span>)}
      </p>
    </section>
  );
}

/* ============================================================ desire: stacking cards */
function Stack({ t, shots }: { t: Tf; shots: string[] | null }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".gt-stack");
      cards.forEach((c, k) => {
        if (k === cards.length - 1) return;
        gsap.to(c.firstElementChild, {
          scale: 0.9, opacity: 0.5, ease: "none",
          scrollTrigger: { trigger: cards[k + 1], start: "top bottom", end: "top top+=140", scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-5 py-32 md:py-48">
      <h2 className="max-w-4xl text-[clamp(2.4rem,4.4vw,4.4rem)] font-light leading-[1.02] tracking-[-0.045em]">{t(ui.notes)}</h2>
      <div className="mt-16">
        {perfumes.map((p, k) => (
          <div id={`gt-card-${p.id}`} key={p.id} className="gt-stack sticky mb-8" style={{ top: `${100 + k * 16}px` }}>
            <article className="grid origin-top grid-cols-1 overflow-hidden rounded-[2.25rem] bg-[var(--surface)] shadow-[0_-30px_60px_-40px_rgba(0,0,0,0.5)] ring-1 ring-[var(--line)] md:h-[520px] md:grid-cols-2">
              <div className="group relative h-80 overflow-hidden md:h-full">
                <Shot shots={shots} i={k} className="transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <p className="text-sm text-[var(--muted)]">{t(p.family)}, {p.traditions.map((x) => t(ui.traditions[x])).join(" / ")}</p>
                <h3 className="mt-2 text-5xl font-light tracking-[-0.045em]">{p.name}</h3>
                <dl className="mt-10 grid gap-5">
                  {(["top", "heart", "base"] as const).map((n) => (
                    <div key={n} className="grid grid-cols-[72px_1fr] items-baseline gap-4 border-t border-[var(--line)] pt-4">
                      <dt className="text-sm text-[var(--muted)]">{t(ui[n])}</dt>
                      <dd className="text-lg">{t(p.notes[n])}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ carousel: the perfumer on his bottles */
function Carousel({ t, shots }: { t: Tf; shots: string[] | null }) {
  const [k, setK] = useState(0);
  const n = perfumes.length;
  const go = (d: number) => setK((x) => (x + d + n) % n);
  const p = perfumes[k];
  return (
    <section className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-16 px-5 py-32 md:grid-cols-12 md:px-12 md:py-48">
      <div className="relative h-[420px] md:col-span-6">
        {[2, 1, 0].map((off) => {
          const idx = (k + off) % n;
          return (
            <div
              key={`${idx}-${off}`}
              className="absolute top-0 h-[400px] w-[300px] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] ring-1 ring-[var(--line)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: `${off * 18}%`, transform: `scale(${1 - off * 0.08}) rotate(${off * 3}deg)`, zIndex: 3 - off, opacity: 1 - off * 0.25 }}
            >
              <Shot shots={shots} i={idx} />
            </div>
          );
        })}
      </div>
      <div className="md:col-span-5 md:col-start-8">
        <h2 className="text-sm text-[var(--muted)]">{t(ui.bottle)}</h2>
        <blockquote className="mt-6 text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.15] tracking-[-0.03em]" aria-live="polite">
          {t(p.bottleNote)}
        </blockquote>
        <p className="mt-6 text-[var(--muted)]">{p.name}</p>
        <div className="mt-10 flex gap-3">
          <button onClick={() => go(-1)} aria-label={t({ fr: "Flacon précédent", en: "Previous bottle" })} className="grid h-14 w-14 place-items-center rounded-full ring-1 ring-[var(--line)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"><ArrowLeft size={20} /></button>
          <button onClick={() => go(1)} aria-label={t({ fr: "Flacon suivant", en: "Next bottle" })} className="grid h-14 w-14 place-items-center rounded-full ring-1 ring-[var(--line)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"><ArrowRight size={20} /></button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ action */
function Action({ t }: { t: Tf }) {
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
    <section id="gt-action" className="relative overflow-hidden bg-[var(--ink)] px-5 py-32 text-[var(--bg)] md:px-12 md:py-48">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full opacity-40 blur-[150px]" style={{ background: perfumes[1].juice }} aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[560px] w-[560px] rounded-full opacity-30 blur-[150px]" style={{ background: perfumes[4].juice }} aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <h2 className="text-[clamp(3rem,8vw,8rem)] font-light leading-[0.95] tracking-[-0.055em]">{t(order.title)}</h2>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed opacity-75">{t(order.text)}</p>
        <form onSubmit={submit} noValidate className="mt-14 max-w-2xl">
          {state === "done" ? (
            <p role="status" className="text-2xl font-light">{t(order.sent)}</p>
          ) : (
            <div className="flex flex-col gap-5">
              <fieldset className="flex flex-wrap gap-2">
                <legend className="mb-3 text-sm opacity-75">{t(order.choiceLabel)}</legend>
                {(["set", "visit"] as const).map((c) => (
                  <label key={c} className={`rounded-full px-5 py-3 text-sm transition-colors ${choice === c ? "bg-[var(--gold)] text-[var(--on-gold)]" : "ring-1 ring-[color-mix(in_srgb,var(--bg)_35%,transparent)] hover:ring-[var(--bg)]"}`}>
                    <input type="radio" name="gt-choice" className="sr-only" checked={choice === c} onChange={() => setChoice(c)} />
                    {t(c === "set" ? order.choiceSet : order.choiceVisit)}
                  </label>
                ))}
              </fieldset>
              <label htmlFor="gt-email" className="text-sm opacity-75">{t(order.emailLabel)}</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="gt-email" type="email" autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                  aria-invalid={state === "error"} aria-describedby="gt-help gt-err"
                  className={`h-14 flex-1 rounded-full bg-transparent px-6 outline-none ring-1 transition-shadow focus:ring-2 focus:ring-[var(--gold)] ${state === "error" ? "ring-[#f87171]" : "ring-[color-mix(in_srgb,var(--bg)_35%,transparent)]"}`}
                />
                <Btn gold type="submit" disabled={state === "sending"}>{state === "sending" ? t(order.sending) : t(choice === "set" ? brand.ctaSet : { fr: "Demander un rendez-vous", en: "Request an appointment" })}</Btn>
              </div>
              <p id="gt-help" className="text-sm opacity-60">{t(order.emailHelp)}</p>
              {state === "error" && <p id="gt-err" role="alert" className="text-sm text-[#fca5a5]">{t(order.emailError)}</p>}
            </div>
          )}
        </form>
        <footer className="mt-32 flex flex-col justify-between gap-6 border-t border-[color-mix(in_srgb,var(--bg)_15%,transparent)] pt-8 text-sm opacity-70 md:flex-row">
          <p>{brand.name}</p>
          <p className="max-w-[60ch]">
            {t({ fr: "Photos d'ingrédients : Wikimedia Commons.", en: "Ingredient photos: Wikimedia Commons." })}{" "}
            {Object.values(ingredientPhotos).map((ph, k) => (
              <a key={ph.file} href={commonsPage(ph.file)} target="_blank" rel="noreferrer" className="mr-2 underline-offset-4 hover:underline">{k + 1}</a>
            ))}
          </p>
        </footer>
      </div>
    </section>
  );
}

/* ============================================================ page */
export default function Landing() {
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const shots = useBottleShots();
  useEffect(() => startSmoothScroll(0.09), []);
  const links = [
    { href: "#gt-collection", label: { fr: "Collection", en: "Collection" } },
    { href: `#gt-card-${perfumes[0].id}`, label: ui.notes },
    { href: "#gt-action", label: { fr: "Coffret", en: "Discovery set" } },
  ];
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <header className="fixed inset-x-0 top-5 z-40 px-5 md:px-12">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between">
          <button onClick={() => scrollToTarget(0)} className="h-12 rounded-full bg-[var(--wash)] px-5 text-[17px] font-medium tracking-[-0.03em] ring-1 ring-[var(--line)] backdrop-blur-xl transition-colors hover:text-[var(--gold)]">{brand.name}</button>
          <ul className="hidden items-center gap-1 rounded-full bg-[var(--wash)] p-1.5 ring-1 ring-[var(--line)] backdrop-blur-xl md:flex">
            {links.map((l) => (
              <li key={l.href}><button onClick={() => scrollToTarget(l.href)} className="rounded-full px-5 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]">{t(l.label)}</button></li>
            ))}
          </ul>
          <div className="flex items-center gap-1 rounded-full bg-[var(--wash)] p-1.5 ring-1 ring-[var(--line)] backdrop-blur-xl">
            {(["fr", "en"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`h-9 w-10 rounded-full text-xs font-semibold uppercase transition-colors ${lang === l ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>{l}</button>
            ))}
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`${t(ui.theme)}: ${t(theme === "dark" ? ui.light : ui.dark)}`}
              className="grid h-9 w-10 place-items-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </nav>
      </header>
      <Hero t={t} lang={lang} theme={theme} shots={shots} />
      <Bento t={t} shots={shots} />
      <Accordion t={t} shots={shots} />
      <Statement lang={lang} />
      <Stack t={t} shots={shots} />
      <Carousel t={t} shots={shots} />
      <Action t={t} />
    </main>
  );
}
