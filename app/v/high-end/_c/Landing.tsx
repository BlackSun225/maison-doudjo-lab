"use client";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { CheckCircle, Moon, Sun, WarningCircle, X } from "@phosphor-icons/react";
import { brand, commons, commonsPage, heritagePhotos, ingredientPhotos, materials, order, perfumer, perfumes, ui, type Lang, type Perfume, type T } from "@/lib/content";
import { useLang } from "@/lib/useLang";
import { useTheme } from "@/lib/useTheme";
import { gsap, lockScroll, ScrollTrigger, scrollToTarget, startSmoothScroll } from "@/lib/smooth";
import Orbs3D, { ESSENCES } from "./Orbs3D";
import { useShots } from "./shots";
import { Bezel, EASE, Eyebrow, Island, Reveal } from "./ui";

type Tf = (x: T) => string;
const SET: T = { fr: "Coffret découverte", en: "Discovery set" };

/* ================================================================ island nav + full-screen glass menu */
function Nav({ t, lang, setLang, theme, setTheme }: { t: Tf; lang: Lang; setLang: (l: Lang) => void; theme: string; setTheme: (x: "light" | "dark") => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);
  const go = (to: string) => { setOpen(false); setTimeout(() => scrollToTarget(to), 380); };
  const links = [
    { to: "#he-collection", label: { fr: "La collection", en: "The collection" } },
    { to: "#he-perfumer", label: perfumer.title },
    { to: "#he-materials", label: { fr: "Les matières", en: "The materials" } },
    { to: "#he-set", label: SET },
  ];
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4">
        <nav className="mt-6 flex w-max items-center gap-1.5 rounded-full bg-[var(--glass)] p-1.5 pl-5 shadow-[var(--shadow)] ring-1 ring-[var(--hair)] backdrop-blur-xl">
          <button onClick={() => go("body")} className="he-display mr-2 text-[13px] font-normal tracking-[0.02em]">MAISON DOUDJO</button>
          <div className="flex rounded-full bg-[var(--shell)] p-1 ring-1 ring-[var(--hair)]">
            {(["fr", "en"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`h-8 w-9 rounded-full text-[11px] font-semibold uppercase transition-all duration-500 ${EASE} ${lang === l ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>{l}</button>
            ))}
          </div>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`${t(ui.theme)}: ${t(theme === "dark" ? ui.light : ui.dark)}`}
            className={`grid h-10 w-10 place-items-center rounded-full text-[var(--muted)] transition-colors duration-500 ${EASE} hover:text-[var(--ink)]`}>
            {theme === "dark" ? <Sun size={17} weight="light" /> : <Moon size={17} weight="light" />}
          </button>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? t({ fr: "Fermer le menu", en: "Close menu" }) : t({ fr: "Ouvrir le menu", en: "Open menu" })}
            className="relative h-10 w-10 rounded-full bg-[var(--ink)] transition-transform duration-500 hover:scale-105 active:scale-95">
            <span className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-[var(--bg)] transition-transform duration-700 ${EASE} ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
            <span className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-[var(--bg)] transition-transform duration-700 ${EASE} ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
          </button>
        </nav>
      </header>
      <div aria-hidden={!open} className={`fixed inset-0 z-30 bg-[var(--glass)] backdrop-blur-3xl transition-opacity duration-700 ${EASE} ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <ul className="mx-auto flex h-full max-w-[1400px] flex-col justify-center gap-2 px-6 md:px-16">
          {links.map((l, i) => (
            <li key={l.to} className="overflow-hidden">
              <button tabIndex={open ? 0 : -1} onClick={() => go(l.to)} style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
                className={`he-display group text-[clamp(2.2rem,6vw,5.5rem)] leading-[1.08] transition-all duration-700 ${EASE} ${open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
                <span className="inline-block transition-transform duration-700 group-hover:translate-x-4">{t(l.label)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* ================================================================ hero: essences into the flacon */
function Hero({ t, theme }: { t: Tf; theme: string }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const tags = useRef<(HTMLElement | null)[]>([]);
  const target = perfumes[1];
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "+=170%", pin: true, scrub: 0.8, onUpdate: (s) => (progress.current = s.progress) } });
      tl.to(".he-hero-copy", { y: -60, opacity: 0, filter: "blur(10px)", duration: 0.35, ease: "power2.in" }, 0.45)
        .fromTo(".he-hero-coda", { y: 60, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "power3.out" }, 0.72);
      gsap.from(".he-in", { y: 64, opacity: 0, filter: "blur(12px)", duration: 1.4, stagger: 0.1, ease: "expo.out", delay: 0.2 });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { progress.current = 1; });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <section ref={ref} className="relative h-[100dvh] overflow-hidden">
      <Orbs3D progress={progress} labels={tags} theme={theme} label={`${target.name}: ${t(target.bottleNote)}`} className="absolute inset-0" />
      {ESSENCES.map((e, i) => (
        <span key={e.key} ref={(n) => { tags.current[i] = n; }} aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-full bg-[var(--glass)] px-3 py-1 text-[11px] font-medium text-[var(--ink)] ring-1 ring-[var(--hair)]">
          {t(ui.traditions[e.key])}
        </span>
      ))}
      <div className="he-hero-copy pointer-events-none absolute inset-0 mx-auto flex max-w-[1400px] items-end px-4 pb-16 md:items-center md:px-12 md:pb-0">
        <div className="max-w-[46rem]">
          <div className="he-in"><Eyebrow>Maison DOUDJO, Abidjan</Eyebrow></div>
          <h1 className="he-in he-display mt-7 text-[clamp(2.6rem,6vw,6rem)] leading-[1]">{t({ fr: "Trois traditions, un flacon", en: "Three traditions, one bottle" })}</h1>
          <p className="he-in mt-7 max-w-[40ch] text-lg leading-relaxed text-[var(--muted)]">{t(brand.heroLine)}</p>
          <div className="he-in pointer-events-auto mt-10 flex flex-wrap gap-3">
            <Island onClick={() => scrollToTarget("#he-collection")}>{t(brand.ctaCollection)}</Island>
            <Island solid={false} onClick={() => scrollToTarget("#he-set")}>{t(SET)}</Island>
          </div>
        </div>
      </div>
      <div className="he-hero-coda pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-4 pb-14 opacity-0 md:px-12">
        <p className="he-display text-[clamp(2.2rem,4.5vw,4.4rem)]">{target.name}</p>
        <p className="mt-2 text-[var(--muted)]">{t(target.notes.top)}, {t(target.notes.heart).toLowerCase()}, {t(target.notes.base).toLowerCase()}</p>
      </div>
    </section>
  );
}

/* ================================================================ collection: asymmetrical bento + glass modal */
const SPANS = ["md:col-span-7 md:row-span-2", "md:col-span-5", "md:col-span-5", "md:col-span-5", "md:col-span-7"];

function Modal({ p, shot, t, onClose }: { p: Perfume; shot?: string; t: Tf; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  const [in_, setIn] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIn(true));
    close.current?.focus({ preventScroll: true });
    lockScroll(true);
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => { removeEventListener("keydown", k); lockScroll(false); };
  }, [onClose]);
  const stagger = (i: number) => ({ style: { transitionDelay: `${120 + i * 70}ms` }, className: `transition-all duration-700 ${EASE} ${in_ ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}` });
  return (
    <div role="dialog" aria-modal="true" aria-label={p.name} onClick={onClose} data-lenis-prevent
      className={`fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-[var(--glass)] p-4 backdrop-blur-3xl transition-opacity duration-500 ${EASE} ${in_ ? "opacity-100" : "opacity-0"}`}>
      <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-5xl transition-transform duration-700 ${EASE} ${in_ ? "scale-100" : "scale-95"}`}>
        <Bezel radius="2.5rem" core="grid grid-cols-1 md:grid-cols-2">
          <div className="relative min-h-[320px]">{shot && <img src={shot} alt={`${p.name}, ${t(p.bottleNote)}`} className="absolute inset-0 h-full w-full object-cover" />}</div>
          <div className="relative p-8 md:p-12">
            <button ref={close} onClick={onClose} aria-label={t({ fr: "Fermer", en: "Close" })}
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full ring-1 ring-[var(--hair)] transition-transform duration-500 hover:rotate-90"><X size={18} weight="light" /></button>
            <div {...stagger(0)}><Eyebrow>{t(p.family)}</Eyebrow></div>
            <h3 {...stagger(1)} className={`${stagger(1).className} he-display mt-6 text-5xl`}>{p.name}</h3>
            <p {...stagger(2)} className={`${stagger(2).className} mt-6 leading-relaxed text-[var(--muted)]`}>{t(p.story)}</p>
            <dl {...stagger(3)} className={`${stagger(3).className} mt-8 grid gap-4`}>
              {(["top", "heart", "base"] as const).map((k) => (
                <div key={k} className="grid grid-cols-[64px_1fr] gap-4">
                  <dt className="text-sm text-[var(--muted)]">{t(ui[k])}</dt>
                  <dd>{t(p.notes[k])}</dd>
                </div>
              ))}
            </dl>
            <p {...stagger(4)} className={`${stagger(4).className} mt-8 text-sm text-[var(--muted)]`}>{t(p.bottleNote)}</p>
          </div>
        </Bezel>
      </div>
    </div>
  );
}

function Collection({ t, shots }: { t: Tf; shots: string[] | null }) {
  const [open, setOpen] = useState<number | null>(null);
  const last = useRef<HTMLButtonElement | null>(null);
  const close = () => { setOpen(null); last.current?.focus(); };
  return (
    <section id="he-collection" className="mx-auto max-w-[1400px] px-4 py-28 md:px-12 md:py-40">
      <Reveal>
        <Eyebrow>{t({ fr: "La collection", en: "The collection" })}</Eyebrow>
        <h2 className="he-display mt-6 max-w-[16ch] text-[clamp(2.4rem,4.6vw,4.6rem)] leading-[1.02]">{t({ fr: "Cinq parfums, cinq flacons", en: "Five perfumes, five bottles" })}</h2>
      </Reveal>
      <div className="mt-16 grid grid-cols-1 gap-5 md:auto-rows-[320px] md:grid-cols-12">
        {perfumes.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 120} className={`min-h-[360px] md:min-h-0 ${SPANS[i]}`}>
            <button onClick={(e) => { last.current = e.currentTarget; setOpen(i); }} className="group block h-full w-full text-left" aria-haspopup="dialog">
              <Bezel radius="2rem" className={`h-full transition-transform duration-700 ${EASE} group-hover:-translate-y-1`} core="relative">
                {shots ? (
                  <img src={shots[i]} alt="" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ${EASE} group-hover:scale-[1.05]`} />
                ) : (
                  <span className="absolute inset-0 animate-pulse bg-[var(--shell)]" />
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-[var(--bg)] via-[color-mix(in_srgb,var(--bg)_55%,transparent)] to-transparent p-6 pt-20 md:p-8">
                  <span>
                    <span className="he-display block text-3xl md:text-4xl">{p.name}</span>
                    <span className="mt-1 block text-sm text-[var(--muted)]">{t(p.family)}</span>
                  </span>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-[var(--hair)] transition-transform duration-700 ${EASE} group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105`}>+</span>
                </span>
              </Bezel>
            </button>
          </Reveal>
        ))}
      </div>
      {open !== null && <Modal p={perfumes[open]} shot={shots?.[open]} t={t} onClose={close} />}
    </section>
  );
}

/* ================================================================ perfumer: second bento */
function Perfumer({ t, lang }: { t: Tf; lang: Lang }) {
  const father = heritagePhotos.find((h) => h.side === "father")!;
  const mother = heritagePhotos.find((h) => h.side === "mother")!;
  const photo = (h: typeof father, i: number, title: T, text: T) => (
    <Reveal delay={i * 120} className="md:col-span-5">
      <Bezel radius="2rem" as="figure" className="h-full" core="flex h-full flex-col">
        <div className="group relative min-h-[240px] flex-1 overflow-hidden">
          <img src={commons(h.file, 1100)} alt={t(h.alt)} loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ${EASE} group-hover:scale-[1.05]`} />
        </div>
        <figcaption className="p-6">
          <p className="he-display text-xl">{t(title)}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{t(text)}</p>
        </figcaption>
      </Bezel>
    </Reveal>
  );
  return (
    <section id="he-perfumer" className="mx-auto max-w-[1400px] px-4 py-28 md:px-12 md:py-40">
      <div className="grid grid-cols-1 gap-5 md:auto-rows-[minmax(300px,auto)] md:grid-cols-12">
        <Reveal className="md:col-span-7 md:row-span-2">
          <Bezel radius="2rem" className="h-full" core="relative flex h-full flex-col justify-between gap-12 p-8 md:p-14">
            <span className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full blur-[100px]" style={{ background: ESSENCES[1].color, opacity: "var(--orb-alpha)" }} />
            <span className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full blur-[100px]" style={{ background: ESSENCES[2].color, opacity: "var(--orb-alpha)" }} />
            <div className="relative">
              <Eyebrow>{t(perfumer.title)}</Eyebrow>
              <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-[var(--muted)]">{t(perfumer.intro)}</p>
            </div>
            <blockquote className="he-display relative text-[clamp(1.6rem,2.8vw,2.7rem)] leading-[1.18]">
              {perfumer.statement[lang].map((l, i) => (
                <Reveal key={`${lang}-${i}`} delay={i * 140}><span className="block">{l}</span></Reveal>
              ))}
            </blockquote>
          </Bezel>
        </Reveal>
        {photo(father, 0, perfumer.father.title, perfumer.father.text)}
        {photo(mother, 1, perfumer.mother.title, perfumer.mother.text)}
      </div>
    </section>
  );
}

/* ================================================================ materials: horizontal glass pills */
function Materials({ t }: { t: Tf }) {
  const all = materials.flatMap((m) => m.items.map((it) => ({ ...it, tradition: m.tradition })));
  return (
    <section id="he-materials" className="py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-12">
        <Reveal>
          <h2 className="he-display max-w-[18ch] text-[clamp(2.4rem,4.6vw,4.6rem)] leading-[1.02]">{t({ fr: "Neuf matières, trois origines", en: "Nine materials, three origins" })}</h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {(["europe", "arabie", "afrique"] as const).map((k, i) => (
            <Reveal key={k} delay={i * 100}>
              <Bezel radius="2rem" core="group relative aspect-[4/3]">
                <img src={commons(ingredientPhotos[k].file, 900)} alt={t(ingredientPhotos[k].alt)} loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ${EASE} group-hover:scale-[1.05]`} />
              </Bezel>
              <p className="he-display mt-4 px-2 text-xl">{t(ui.traditions[k])}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <div className="mt-12 flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:px-12 [scrollbar-width:none]">
        {all.map((it) => (
          <div key={it.name.en} className="shrink-0 snap-start rounded-full bg-[var(--shell)] p-1 ring-1 ring-[var(--hair)]">
            <div className="flex items-baseline gap-3 rounded-full bg-[var(--core)] px-5 py-3 shadow-[var(--core-hi)]">
              <span className="font-medium">{t(it.name)}</span>
              <span className="text-sm text-[var(--muted)]">{t(it.place)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================ order */
function Order({ t }: { t: Tf }) {
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
    <section id="he-set" className="mx-auto max-w-[1400px] px-4 py-28 md:px-12 md:py-40">
      <Reveal>
        <Bezel radius="3rem" core="relative grid grid-cols-1 gap-12 p-8 md:grid-cols-12 md:p-16">
          <span className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full blur-[110px]" style={{ background: ESSENCES[0].color, opacity: "var(--orb-alpha)" }} />
          <div className="relative md:col-span-6">
            <Eyebrow>{t(SET)}</Eyebrow>
            <h2 className="he-display mt-6 text-[clamp(2.4rem,4.6vw,4.6rem)] leading-[1.02]">{t(order.title)}</h2>
            <p className="mt-6 max-w-[46ch] leading-relaxed text-[var(--muted)]">{t(order.text)}</p>
          </div>
          <form onSubmit={submit} noValidate className="relative flex flex-col justify-end gap-6 md:col-span-5 md:col-start-8">
            {state === "done" ? (
              <p role="status" className="he-display flex items-center gap-3 text-2xl"><CheckCircle size={28} weight="light" /> {t(order.sent)}</p>
            ) : (
              <>
                <fieldset>
                  <legend className="mb-3 text-sm">{t(order.choiceLabel)}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(["set", "visit"] as const).map((c) => (
                      <label key={c} className={`rounded-full px-5 py-3 text-sm transition-all duration-500 ${EASE} ${choice === c ? "bg-[var(--ink)] text-[var(--bg)]" : "ring-1 ring-[var(--hair)] hover:ring-[var(--muted)]"}`}>
                        <input type="radio" name="he-choice" className="sr-only" checked={choice === c} onChange={() => setChoice(c)} />
                        {t(c === "set" ? order.choiceSet : order.choiceVisit)}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="flex flex-col gap-2">
                  <label htmlFor="he-email" className="text-sm">{t(order.emailLabel)}</label>
                  <div className="rounded-full bg-[var(--shell)] p-1 ring-1 ring-[var(--hair)]">
                    <input
                      id="he-email" type="email" autoComplete="email" value={email}
                      onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                      onBlur={() => { if (email && !valid(email)) setState("error"); }}
                      aria-invalid={state === "error"} aria-describedby="he-help he-err"
                      className={`h-14 w-full rounded-full bg-[var(--core)] px-6 text-[var(--ink)] shadow-[var(--core-hi)] outline-none transition-shadow duration-500 ${EASE} focus:shadow-[0_0_0_1.5px_var(--ink)] ${state === "error" ? "shadow-[0_0_0_1.5px_#d9534f]" : ""}`}
                    />
                  </div>
                  <p id="he-help" className="text-sm text-[var(--muted)]">{t(order.emailHelp)}</p>
                  {state === "error" && <p id="he-err" role="alert" className="flex items-center gap-1.5 text-sm text-[#d9534f]"><WarningCircle size={16} weight="light" /> {t(order.emailError)}</p>}
                </div>
                <div><Island type="submit" disabled={state === "sending"}>{state === "sending" ? t(order.sending) : t(choice === "set" ? brand.ctaSet : { fr: "Demander un rendez-vous", en: "Request an appointment" })}</Island></div>
              </>
            )}
          </form>
        </Bezel>
      </Reveal>
      <footer className="mt-16 flex flex-col justify-between gap-4 px-2 text-sm text-[var(--muted)] md:flex-row">
        <p className="he-display text-[var(--ink)]">MAISON DOUDJO</p>
        <p className="max-w-[64ch]">
          {t({ fr: "Atelier à Abidjan. Photos : Wikimedia Commons", en: "Atelier in Abidjan. Photos: Wikimedia Commons" })}{" "}
          {[...heritagePhotos.slice(0, 1), heritagePhotos[3], ...Object.values(ingredientPhotos)].map((ph, i) => (
            <a key={ph.file} href={commonsPage(ph.file)} target="_blank" rel="noreferrer" className="mr-2 transition-colors hover:text-[var(--ink)]">{i + 1}</a>
          ))}
        </p>
      </footer>
    </section>
  );
}

/* ================================================================ page */
export default function Landing() {
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const shots = useShots();
  useEffect(() => startSmoothScroll(0.08), []);
  useEffect(() => { ScrollTrigger.refresh(); }, [shots]);
  return (
    <>
      <Nav t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
      <main>
        <Hero t={t} theme={theme} />
        <Collection t={t} shots={shots ? shots[theme === "dark" ? "dark" : "light"] : null} />
        <Perfumer t={t} lang={lang} />
        <Materials t={t} />
        <Order t={t} />
      </main>
    </>
  );
}
