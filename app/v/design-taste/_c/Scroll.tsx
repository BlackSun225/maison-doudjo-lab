"use client";
// GSAP-only sections (no Motion in this tree). Each animation has one job:
//  Curtain: reveal (the shelf behind the brand is the product), Pan: storytelling, one perfume per frame,
//  Heritage: two lineages moving in opposite directions, father and mother.
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowDownRight, ArrowRight } from "@phosphor-icons/react";
import { brand, commons, heritagePhotos, perfumer, perfumes, ui, type T } from "@/lib/content";
import { gsap, ScrollTrigger, scrollToTarget } from "@/lib/smooth";
import { Shelf3D } from "./Shelf3D";

type Tf = (x: T) => string;
export const CTA_SET: T = { fr: "Demander le coffret", en: "Request the set" };
const CTA_EXPLORE: T = { fr: "Voir la collection", en: "See the collection" };

/* ------------------------------------------------------------- curtain hero */
export function Curtain({ t, theme }: { t: Tf; theme: string }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current, start: "top top", end: "+=130%", pin: true, scrub: 1,
          onUpdate: (s) => (progress.current = s.progress),
        },
      });
      tl.to(".dt-curtain-l", { xPercent: -100, ease: "power2.inOut" }, 0)
        .to(".dt-curtain-r", { xPercent: 100, ease: "power2.inOut" }, 0)
        .from(".dt-shelf-caption", { opacity: 0, y: 24 }, 0.55);
    });
    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => { progress.current = 1; });
    gsap.from(".dt-hero-in", { y: 30, opacity: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", delay: 0.15 });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <section ref={ref} className="relative overflow-hidden md:h-[100dvh]">
      <Shelf3D progress={progress} theme={theme} label={perfumes.map((p) => p.name).join(", ")} className="h-[60dvh] w-full md:absolute md:inset-0 md:h-full" />
      <p className="dt-shelf-caption pointer-events-none absolute inset-x-0 bottom-10 hidden text-center text-sm text-[var(--ink-2)] md:block">
        {perfumes.map((p) => p.name).join(", ")}
      </p>

      {/* two panels part like a curtain; the 3D shelf sits in the slit between them */}
      <div className="dt-curtain-l relative z-10 flex flex-col justify-end bg-[var(--bg)] px-4 pb-10 pt-28 md:absolute md:inset-y-0 md:left-0 md:w-[calc(50%-13vw)] md:border-r md:border-[var(--line)] md:px-10 md:pb-16 md:pt-24">
        <h1 className="dt-hero-in dt-display text-[clamp(2.6rem,4.6vw,4.6rem)] font-semibold leading-[1.02]">
          {t({ fr: "Trois mondes, un parfumeur", en: "Three worlds, one perfumer" })}
        </h1>
      </div>
      <div className="dt-curtain-r relative z-10 flex flex-col justify-end gap-8 bg-[var(--bg)] px-4 pb-14 md:absolute md:inset-y-0 md:right-0 md:w-[calc(50%-13vw)] md:border-l md:border-[var(--line)] md:px-10 md:pb-16">
        <p className="dt-hero-in max-w-[34ch] text-lg leading-relaxed text-[var(--ink-2)]">{t(brand.tagline)}</p>
        <div className="dt-hero-in flex flex-wrap gap-3">
          <button className="dt-btn dt-btn--accent" onClick={() => scrollToTarget("#dt-collection")}>
            {t(CTA_EXPLORE)} <ArrowDownRight size={18} weight="bold" className="dt-arrow" />
          </button>
          <button className="dt-btn dt-btn--ghost" onClick={() => scrollToTarget("#dt-set")}>{t(CTA_SET)}</button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- horizontal pan (canonical 5.B) */
export function Pan({ t, shots }: { t: Tf; shots: string[] | null }) {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => track.current!.scrollWidth - window.innerWidth;
      const tween = gsap.to(track.current, {
        x: () => -distance(), ease: "none",
        scrollTrigger: { trigger: wrap.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
      });
      // each still drifts against the track: depth, so the bottle feels like an object, not a tile
      gsap.utils.toArray<HTMLElement>(".dt-still").forEach((img) => {
        gsap.fromTo(img, { xPercent: -6, scale: 1.12 }, { xPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    });
    return () => mm.revert();
  }, { scope: wrap, dependencies: [shots] });

  return (
    <section id="dt-collection" ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex flex-col gap-24 px-4 py-28 md:h-[100dvh] md:w-max md:flex-row md:items-center md:gap-[7vw] md:px-[6vw] md:py-0">
        <div className="md:w-[30vw] md:shrink-0">
          <h2 className="dt-display text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-[1]">{t({ fr: "Cinq parfums, cinq histoires", en: "Five perfumes, five stories" })}</h2>
          <p className="mt-6 max-w-[36ch] text-lg leading-relaxed text-[var(--ink-2)]">{t(brand.heroLine)}</p>
        </div>
        {perfumes.map((p, i) => (
          <article key={p.id} className="grid grid-cols-1 gap-8 md:w-[72vw] md:max-w-[1100px] md:shrink-0 md:grid-cols-12 md:items-center md:gap-12">
            <div className="overflow-hidden rounded-[24px] bg-[var(--bg-2)] md:col-span-5">
              {shots ? (
                <img src={shots[i]} alt={`${p.name}, ${t(p.bottleNote)}`} className="dt-still aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="aspect-[4/5] w-full animate-pulse bg-[var(--line)]" />
              )}
            </div>
            <div className="md:col-span-7">
              <h3 className="dt-display text-5xl font-semibold md:text-6xl">{p.name}</h3>
              <p className="mt-3 text-[var(--accent)]">{t(p.family)}</p>
              <p className="mt-6 max-w-[58ch] leading-relaxed text-[var(--ink-2)]">{t(p.story)}</p>
              <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {(["top", "heart", "base"] as const).map((k) => (
                  <div key={k}>
                    <dt className="text-sm text-[var(--ink-2)]">{t(ui[k])}</dt>
                    <dd className="mt-1 text-[17px] leading-snug">{t(p.notes[k])}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
        <div className="hidden w-[6vw] shrink-0 md:block" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- split-screen heritage */
export function Heritage({ t }: { t: Tf }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const left = ref.current!.querySelector<HTMLElement>(".dt-col-father")!;
      const right = ref.current!.querySelector<HTMLElement>(".dt-col-mother")!;
      const travel = () => Math.max(0, left.scrollHeight - window.innerHeight * 0.78);
      gsap.set(right, { y: () => -travel() });
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: () => `+=${travel() * 1.1}`, pin: true, scrub: 1, invalidateOnRefresh: true } });
      tl.to(left, { y: () => -travel(), ease: "none" }, 0).to(right, { y: 0, ease: "none" }, 0);
    });
    return () => mm.revert();
  }, { scope: ref });

  const col = (side: "father" | "mother") => {
    const x = perfumer[side];
    return (
      <div className={`dt-col-${side} flex flex-col gap-6 md:pt-28`}>
        <div className="pb-4">
          <h3 className="dt-display text-3xl font-semibold md:text-4xl">{t(x.title)}</h3>
          <p className="mt-4 max-w-[40ch] leading-relaxed text-[var(--ink-2)]">{t(x.text)}</p>
        </div>
        {heritagePhotos.filter((h) => h.side === side).map((h) => (
          <figure key={h.file}>
            <div className="group overflow-hidden rounded-[24px] bg-[var(--bg-2)]">
              <img src={commons(h.file, 900)} alt={t(h.alt)} loading="eager" className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
            </div>
            <figcaption className="mt-2 text-sm text-[var(--ink-2)]">{t(h.alt)}</figcaption>
          </figure>
        ))}
      </div>
    );
  };

  return (
    <section ref={ref} className="relative overflow-hidden md:h-[100dvh]">
      <div className="mx-auto grid h-full max-w-[1400px] grid-cols-1 gap-12 px-4 py-28 md:grid-cols-12 md:gap-10 md:px-10 md:py-0">
        <div className="md:col-span-4 md:flex md:flex-col md:justify-center">
          <h2 className="dt-display text-[clamp(2.4rem,4vw,4rem)] font-semibold leading-[1.02]">{t(perfumer.title)}</h2>
          <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-[var(--ink-2)]">{t(perfumer.intro)}</p>
          <button className="dt-btn dt-btn--ghost mt-8 self-start" onClick={() => scrollToTarget("#dt-set")}>
            {t(CTA_SET)} <ArrowRight size={18} className="dt-arrow" />
          </button>
        </div>
        <div className="md:col-span-4">{col("father")}</div>
        <div className="md:col-span-4">{col("mother")}</div>
      </div>
    </section>
  );
}
