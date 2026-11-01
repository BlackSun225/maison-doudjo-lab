"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle, Moon, Sun, WarningCircle } from "@phosphor-icons/react";
import { brand, commons, commonsPage, heritagePhotos, ingredientPhotos, materials, order, perfumer, perfumes, ui, type Lang, type T } from "@/lib/content";
import { useLang } from "@/lib/useLang";
import { useTheme } from "@/lib/useTheme";
import { scrollToTarget, startSmoothScroll } from "@/lib/smooth";
import { Curtain, Heritage, Pan, CTA_SET } from "./Scroll";
import { useShots } from "./Shelf3D";

type Tf = (x: T) => string;
const ease = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------- materials bento: exactly 5 cells */
function Materials({ t, lang, shots }: { t: Tf; lang: Lang; shots: string[] | null }) {
  const reduce = useReducedMotion();
  const enter = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 32 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 0.8, delay: i * 0.06, ease } });
  const photoCell = (k: "afrique" | "europe" | "arabie", span: string, i: number) => {
    const ph = ingredientPhotos[k];
    const m = materials.find((x) => x.tradition === k)!;
    return (
      <motion.figure {...enter(i)} className={`group flex flex-col ${span}`}>
        <div className="relative min-h-[240px] flex-1 overflow-hidden rounded-[24px]">
          <img src={commons(ph.file, 1200)} alt={t(ph.alt)} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
        </div>
        <figcaption className="pt-4">
          <span className="dt-display text-2xl font-semibold">{t(ui.traditions[k])}</span>
          <span className="mt-1 block text-[15px] text-[var(--ink-2)]">{m.items.map((it) => `${t(it.name)}, ${t(it.place)}`).join(" / ")}</span>
        </figcaption>
      </motion.figure>
    );
  };
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-28 md:px-10 md:py-40">
      <h2 className="dt-display max-w-[18ch] text-[clamp(2.4rem,4vw,4rem)] font-semibold leading-[1.02]">{t({ fr: "Trois traditions, une palette", en: "Three traditions, one palette" })}</h2>
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12 md:grid-rows-[300px_300px_auto]">
        {photoCell("afrique", "md:col-span-7 md:row-span-2", 0)}
        {photoCell("europe", "md:col-span-5", 1)}
        {photoCell("arabie", "md:col-span-5", 2)}
        <motion.blockquote {...enter(3)} className="flex flex-col justify-between gap-8 rounded-[24px] bg-[color-mix(in_srgb,var(--accent)_16%,var(--panel))] p-8 md:col-span-8 md:p-12">
          <p className="dt-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium leading-[1.15]">
            {`“${perfumer.statement[lang][2].replace(/,$/, "")} ${perfumer.statement[lang][3].replace(/\.$/, "")}.”`}
          </p>
          <footer className="text-[var(--ink-2)]">{t({ fr: "Le fondateur, parfumeur de Maison DOUDJO", en: "The founder, perfumer of Maison DOUDJO" })}</footer>
        </motion.blockquote>
        <motion.div {...enter(4)} className="grid grid-cols-5 gap-2 rounded-[24px] bg-[var(--panel)] p-2 md:col-span-4">
          {perfumes.map((p, i) => (
            <div key={p.id} className="overflow-hidden rounded-[18px] bg-[var(--bg-2)]">
              {shots ? <img src={shots[i]} alt={p.name} className="h-full w-full object-cover" /> : <div className="h-full min-h-32 w-full animate-pulse bg-[var(--line)]" />}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- order */
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
    <section id="dt-set" className="mx-auto max-w-[1400px] px-4 pb-16 md:px-10">
      <div className="grid grid-cols-1 gap-12 rounded-[24px] bg-[var(--panel)] p-8 md:grid-cols-12 md:p-16">
        <div className="md:col-span-6">
          <h2 className="dt-display text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[1]">{t(order.title)}</h2>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-[var(--ink-2)]">{t(order.text)}</p>
        </div>
        <form onSubmit={submit} noValidate className="flex flex-col justify-end gap-5 md:col-span-5 md:col-start-8">
          {state === "done" ? (
            <p role="status" className="flex items-center gap-3 text-xl"><CheckCircle size={26} weight="fill" className="text-[var(--accent)]" /> {t(order.sent)}</p>
          ) : (
            <>
              <fieldset>
                <legend className="mb-3 text-sm font-medium">{t(order.choiceLabel)}</legend>
                <div className="flex flex-wrap gap-2">
                  {(["set", "visit"] as const).map((c) => (
                    <label key={c} className={`flex h-11 items-center rounded-full px-5 text-[15px] transition-colors ${choice === c ? "bg-[var(--ink)] text-[var(--bg)]" : "shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--ink)]"}`}>
                      <input type="radio" name="dt-choice" className="sr-only" checked={choice === c} onChange={() => setChoice(c)} />
                      {t(c === "set" ? order.choiceSet : order.choiceVisit)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-col gap-2">
                <label htmlFor="dt-email" className="text-sm font-medium">{t(order.emailLabel)}</label>
                <input
                  id="dt-email" type="email" autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                  onBlur={() => { if (email && !valid(email)) setState("error"); }}
                  aria-invalid={state === "error"} aria-describedby="dt-help dt-err"
                  className={`h-14 rounded-full bg-[var(--bg)] px-6 text-lg outline-none transition-shadow ${state === "error" ? "shadow-[inset_0_0_0_1.5px_var(--error)]" : "shadow-[inset_0_0_0_1px_var(--line)] focus:shadow-[inset_0_0_0_1.5px_var(--ink)]"}`}
                />
                <p id="dt-help" className="text-sm text-[var(--ink-2)]">{t(order.emailHelp)}</p>
                {state === "error" && <p id="dt-err" role="alert" className="flex items-center gap-1.5 text-sm text-[var(--error)]"><WarningCircle size={16} /> {t(order.emailError)}</p>}
              </div>
              <button type="submit" disabled={state === "sending"} className="dt-btn dt-btn--accent self-start disabled:opacity-60">
                {state === "sending" ? <span className="h-2 w-20 animate-pulse rounded-full bg-[var(--on-accent)]/30" /> : t(choice === "set" ? CTA_SET : { fr: "Demander un rendez-vous", en: "Request a visit" })}
              </button>
            </>
          )}
        </form>
      </div>
      <footer className="mt-14 flex flex-col justify-between gap-4 border-t border-[var(--line)] pt-8 text-sm text-[var(--ink-2)] md:flex-row">
        <p className="dt-display text-lg font-semibold text-[var(--ink)]">{brand.name}</p>
        <p className="max-w-[64ch]">
          {t({ fr: "Atelier à Abidjan. Photos : Wikimedia Commons", en: "Atelier in Abidjan. Photos: Wikimedia Commons" })}{" "}
          {[...heritagePhotos, ...Object.values(ingredientPhotos)].map((ph, i) => (
            <a key={ph.file} href={commonsPage(ph.file)} target="_blank" rel="noreferrer" className="mr-2 transition-colors hover:text-[var(--accent)]">{i + 1}</a>
          ))}
        </p>
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------- page */
export default function Landing() {
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const shots = useShots();
  useEffect(() => startSmoothScroll(0.09), []);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <nav className="mx-auto mt-3 flex h-16 max-w-[1400px] items-center justify-between rounded-full bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] px-5 backdrop-blur-md md:mx-6 md:px-6 xl:mx-auto">
          <button onClick={() => scrollToTarget(0)} className="dt-display text-lg font-semibold">{brand.name}</button>
          <ul className="hidden items-center gap-8 text-[15px] text-[var(--ink-2)] md:flex">
            <li><button onClick={() => scrollToTarget("#dt-collection")} className="transition-colors hover:text-[var(--ink)]">{t({ fr: "Collection", en: "Collection" })}</button></li>
            <li><button onClick={() => scrollToTarget("#dt-set")} className="transition-colors hover:text-[var(--ink)]">{t(CTA_SET)}</button></li>
          </ul>
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Langue / Language" className="flex rounded-full p-1 shadow-[inset_0_0_0_1px_var(--line)]">
              {(["fr", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                  className={`h-8 w-9 rounded-full text-xs font-semibold uppercase transition-colors ${lang === l ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"}`}>{l}</button>
              ))}
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`${t(ui.theme)}: ${t(theme === "dark" ? ui.light : ui.dark)}`}
              className="grid h-10 w-10 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>
      </header>
      <main>
        <Curtain t={t} theme={theme} />
        <Pan t={t} shots={shots} />
        <Heritage t={t} />
        <Materials t={t} lang={lang} shots={shots} />
        <Order t={t} />
      </main>
    </>
  );
}
