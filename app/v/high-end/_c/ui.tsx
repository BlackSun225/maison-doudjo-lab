"use client";
// Haptic primitives: Double-Bezel shell, eyebrow pill, button-in-button, blur fade-up reveal.
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";

export const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

export function Bezel({ children, className = "", core = "", radius = "2rem", as: Tag = "div", ...rest }: React.PropsWithChildren<{ className?: string; core?: string; radius?: string; as?: "div" | "article" | "figure" } & React.HTMLAttributes<HTMLElement>>) {
  return (
    <Tag className={`bg-[var(--shell)] p-1.5 ring-1 ring-[var(--hair)] ${className}`} style={{ borderRadius: radius }} {...rest}>
      <div className={`h-full overflow-hidden bg-[var(--core)] shadow-[var(--core-hi)] ${core}`} style={{ borderRadius: `calc(${radius} - 0.375rem)` }}>
        {children}
      </div>
    </Tag>
  );
}

export function Eyebrow({ children }: React.PropsWithChildren) {
  return <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)] ring-1 ring-[var(--hair)]">{children}</span>;
}

export function Island({ children, onClick, solid = true, type = "button", disabled }: React.PropsWithChildren<{ onClick?: () => void; solid?: boolean; type?: "button" | "submit"; disabled?: boolean }>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex items-center gap-4 whitespace-nowrap rounded-full py-2 pl-6 pr-2 text-[15px] font-medium transition-all duration-700 ${EASE} active:scale-[0.98] disabled:opacity-50 ${
        solid ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink)] ring-1 ring-[var(--hair)] hover:ring-[var(--muted)]"
      }`}
    >
      {children}
      <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-700 ${EASE} group-hover:-translate-y-[1px] group-hover:translate-x-1 group-hover:scale-105 ${solid ? "bg-[var(--bg)]/15" : "bg-[var(--shell)] ring-1 ring-[var(--hair)]"}`}>
        <ArrowUpRight size={15} weight="light" />
      </span>
    </button>
  );
}

/** Heavy fade-up with blur, once, via IntersectionObserver. */
export function Reveal({ children, delay = 0, className = "" }: React.PropsWithChildren<{ delay?: number; className?: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setOn(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-[1100ms] ${EASE} ${on ? "translate-y-0 opacity-100 blur-0" : "translate-y-16 opacity-0 blur-md"} ${className}`}>
      {children}
    </div>
  );
}
