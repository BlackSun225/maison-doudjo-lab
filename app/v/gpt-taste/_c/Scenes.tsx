"use client";
// Three.js for this variant:
//  - useBottleShots: renders each flacon once as a studio "photo" (no product photography exists yet)
//  - HeroBottle: the live hero bottle, slowly turning, scroll tilts it toward the viewer
import { memo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MorphBottle } from "@/lib/bottle3d";
import { perfumes } from "@/lib/content";

function glowTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(256, 230, 10, 256, 256, 360);
  r.addColorStop(0, inner);
  r.addColorStop(1, outer);
  g.fillStyle = r;
  g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function studio(r: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  const env = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(-3, 4, 4);
  scene.add(key);
  return { scene, dispose: () => { env.dispose(); pm.dispose(); } };
}

/** One image per perfume: the bottle on a glow of its own juice. Returns null until rendered. */
export function useBottleShots(w = 720, h = 900) {
  const [shots, setShots] = useState<string[] | null>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    r.setSize(w, h, false);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    const { scene, dispose } = studio(r);
    const cam = new THREE.PerspectiveCamera(28, w / h, 0.1, 50);
    cam.position.set(0, 0.25, 7.4);
    const bottle = new MorphBottle();
    bottle.group.rotation.y = 0.55;
    bottle.group.scale.setScalar(0.92);
    scene.add(bottle.group);
    const out: string[] = [];
    for (const p of perfumes) {
      const juice = new THREE.Color(p.juice);
      const inner = "#" + juice.clone().lerp(new THREE.Color("#ffffff"), 0.55).getHexString();
      const outer = "#" + juice.clone().multiplyScalar(0.42).getHexString();
      const bg = glowTexture(inner, outer);
      scene.background = bg;
      bottle.set(p.bottle, p.bottle, 0, p.juice);
      r.render(scene, cam);
      out.push(canvas.toDataURL("image/webp", 0.9));
      bg.dispose();
    }
    setShots(out);
    bottle.dispose(); dispose(); r.dispose();
  }, [w, h]);
  return shots;
}

/** Live hero bottle. `index` picks the flacon; `tilt` (0..1) is scroll progress through the hero. */
export const HeroBottle = memo(function HeroBottle({ index, tilt, theme, className, label }: { index: number; tilt: React.RefObject<number>; theme: string; className?: string; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ setBg: () => void; setIndex: (i: number) => void } | null>(null);

  useEffect(() => {
    const el = host.current!;
    const root = el.closest(".gt") as HTMLElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = new THREE.WebGLRenderer({ antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(r.domElement);
    const { scene, dispose } = studio(r);
    const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    cam.position.set(0, 0.2, 7.6);
    const bottle = new MorphBottle();
    scene.add(bottle.group);

    let from = 0, to = 0, k = 1;
    const setIndex = (i: number) => { from = to; to = i; k = reduce ? 1 : 0; };
    const setBg = () => {
      const css = getComputedStyle(root);
      const bg = new THREE.Color(css.getPropertyValue("--bg").trim() || "#f7f5f2");
      const juice = new THREE.Color(perfumes[to].juice);
      const old = scene.background as THREE.Texture | null;
      scene.background = glowTexture("#" + bg.clone().lerp(juice, 0.28).getHexString(), "#" + bg.getHexString());
      old?.dispose?.();
    };
    api.current = { setBg, setIndex };
    setBg();

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
    });
    ro.observe(el);
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      if (k < 1) {
        k = Math.min(1, k + 0.018);
        const e = k * k * (3 - 2 * k);
        bottle.set(perfumes[from].bottle, perfumes[to].bottle, e, new THREE.Color(perfumes[from].juice).lerp(new THREE.Color(perfumes[to].juice), e));
        if (k === 1) setBg();
      }
      const s = tilt.current ?? 0;
      bottle.group.rotation.y = (reduce ? 0.6 : now / 4200) + s * 2.2;
      bottle.group.rotation.z = s * -0.18;
      bottle.group.position.x = s * 0.6;
      bottle.group.scale.setScalar(0.82 - s * 0.12);
      r.render(scene, cam);
    };
    bottle.set(perfumes[0].bottle, perfumes[0].bottle, 0, perfumes[0].juice);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); bottle.dispose(); (scene.background as THREE.Texture | null)?.dispose?.(); dispose(); r.dispose(); el.removeChild(r.domElement); api.current = null; };
  }, [tilt]);

  useEffect(() => { api.current?.setIndex(index); }, [index]);
  useEffect(() => { requestAnimationFrame(() => api.current?.setBg()); }, [theme]);
  return <div ref={host} role="img" aria-label={label} className={className} />;
});
