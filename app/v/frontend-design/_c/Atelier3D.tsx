"use client";
// The one bold element: a real glass bottle that morphs from flacon to flacon as the collection scrolls,
// refracting the current name painted on a plane behind it. Isolated Three.js leaf.
import { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MorphBottle } from "@/lib/bottle3d";
import { brand, perfumes } from "@/lib/content";
import type { Theme } from "@/lib/useTheme";

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Shared mapping from section progress (0..1) to the bottle state. Hero = first unit, then 5 chapters. */
export function chapterAt(progress: number) {
  const P = progress * 6;
  const bf = Math.min(4, Math.max(0, P - 0.6));
  const a = Math.min(4, Math.floor(bf));
  const t = a < 4 ? smooth(0.62, 1, bf - a) : 0;
  return { P, a, t, active: t > 0.5 ? a + 1 : a, hero: P < 1 };
}

type Props = { progress: React.RefObject<number>; label: string; theme: Theme; className?: string; ariaLabel: string };

function Atelier3D({ progress, label, theme, className, ariaLabel }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ draw: (s: string) => void; retheme: () => void } | null>(null);

  useEffect(() => {
    const el = host.current!;
    const root = el.closest(".fd") as HTMLElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = new THREE.WebGLRenderer({ antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    el.appendChild(r.domElement);

    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r);
    const env = pm.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(3, 5, 4);
    const rim = new THREE.PointLight(0xffffff, 18, 12);
    rim.position.set(-2.5, 1.5, -1.5);
    scene.add(key, rim);

    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    cam.position.set(0, 0, 7.2);

    // name plane behind the bottle: opaque, so the glass's transmission pass refracts it
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    plane.position.z = -2.4;
    scene.add(plane);

    const bottle = new MorphBottle();
    scene.add(bottle.group);

    let current = label;
    const css = (v: string) => getComputedStyle(root).getPropertyValue(v).trim();
    const draw = (text: string) => {
      current = text;
      const w = canvas.width, h = canvas.height;
      const bg = css("--bg") || "#eceef1";
      // brand name in full ink; perfume names as a faint wash of their juice so the copy stays readable
      const pf = perfumes.find((p) => p.name === text);
      const dark = document.documentElement.dataset.theme === "dark";
      const ink = !pf
        ? css("--ink") || "#161a33"
        : "#" + new THREE.Color(bg).lerp(new THREE.Color(dark ? pf.juiceDark : pf.juice), dark ? 0.3 : 0.34).getHexString();
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const fam = css("--fd-display") || "serif";
      const words = text.split(" ");
      // two balanced lines for anything longer than one word
      let lines = [text];
      if (words.length > 1) {
        let best = 1, diff = Infinity;
        for (let i = 1; i < words.length; i++) {
          const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
          if (d < diff) { diff = d; best = i; }
        }
        lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
      }
      let size = h * (lines.length > 1 ? 0.36 : 0.5);
      ctx.font = `400 ${size}px ${fam}`;
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (widest > w * 0.92) { size *= (w * 0.92) / widest; ctx.font = `400 ${size}px ${fam}`; }
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lh = size * 0.98;
      lines.forEach((l, i) => ctx.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * lh));
      tex.needsUpdate = true;
    };
    const retheme = () => { scene.background = new THREE.Color(css("--bg") || "#eceef1"); draw(current); };
    api.current = { draw, retheme };

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      r.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      const dist = cam.position.z - plane.position.z;
      const ph = 2 * Math.tan((cam.fov * Math.PI) / 360) * dist;
      plane.scale.set(ph * cam.aspect, ph, 1);
      // WebGL2 textures are immutable in size: re-allocate when the canvas changes size
      const cw = Math.min(4096, Math.round(w * Math.min(devicePixelRatio, 2)));
      if (canvas.width !== cw) {
        canvas.width = cw;
        canvas.height = Math.round(cw / cam.aspect);
        tex.dispose();
      }
      draw(current);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    document.fonts?.ready.then(() => draw(current));
    retheme();

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const mv = (e: PointerEvent) => { ptr.tx = e.clientX / innerWidth - 0.5; ptr.ty = e.clientY / innerHeight - 0.5; };
    addEventListener("pointermove", mv, { passive: true });

    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);

    const juiceA = new THREE.Color(), juiceB = new THREE.Color();
    let lastKey = "", sp = progress.current ?? 0, raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      sp += ((progress.current ?? 0) - sp) * (reduce ? 1 : 0.1);
      const { P, a, t } = chapterAt(sp);
      const key = `${a}:${t.toFixed(3)}:${document.documentElement.dataset.theme}`;
      if (key !== lastKey) {
        lastKey = key;
        const dark = document.documentElement.dataset.theme === "dark";
        const pa = perfumes[a], pb = perfumes[Math.min(4, a + 1)];
        juiceA.set(dark ? pa.juiceDark : pa.juice).lerp(juiceB.set(dark ? pb.juiceDark : pb.juice), t);
        bottle.set(pa.bottle, pb.bottle, t, juiceA);
        rim.color.copy(juiceA);
      }
      // hero: the bottle rises into place; chapters: it turns with the scroll
      const rise = smooth(0, 1, P);
      ptr.x += (ptr.tx - ptr.x) * 0.05; ptr.y += (ptr.ty - ptr.y) * 0.05;
      bottle.group.rotation.y = (reduce ? 0.5 : now / 5000) + sp * Math.PI * 5 + ptr.x * 0.4;
      bottle.group.rotation.x = ptr.y * 0.15;
      // sized so the widest flacon stays inside the centre columns (story left, notes right)
      const narrow = cam.aspect < 1 ? 0.62 : 0.68;
      bottle.group.scale.setScalar(narrow + rise * 0.06);
      r.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener("pointermove", mv);
      bottle.dispose(); plane.geometry.dispose(); (plane.material as THREE.Material).dispose(); tex.dispose();
      env.dispose(); pm.dispose(); r.dispose(); el.removeChild(r.domElement); api.current = null;
    };
  }, [progress]);

  useEffect(() => { api.current?.draw(label); }, [label]);
  useEffect(() => { requestAnimationFrame(() => api.current?.retheme()); }, [theme]);

  return <div ref={host} role="img" aria-label={ariaLabel} className={className} />;
}

export default memo(Atelier3D);
