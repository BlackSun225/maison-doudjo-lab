"use client";
// Three glowing essences (Europe, Arabia, Africa) orbit an empty flacon. Scroll progress spirals them into
// the neck and fills the bottle with the juice they make together. Isolated Three.js leaf; HTML labels follow
// the orbs through projected screen positions written straight to the DOM (no React state per frame).
import { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MorphBottle } from "@/lib/bottle3d";
import { perfumes } from "@/lib/content";

export const ESSENCES = [
  { key: "europe" as const, color: "#7f9cc7" },  // iris / lagoon blue
  { key: "arabie" as const, color: "#d9a03a" },  // saffron / resin gold
  { key: "afrique" as const, color: "#b0543f" }, // kola / cocoa red
];

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function haloTexture(color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, color);
  r.addColorStop(0.35, color + "88");
  r.addColorStop(1, color + "00");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type Props = { progress: React.RefObject<number>; labels: React.RefObject<(HTMLElement | null)[]>; theme: string; className?: string; label: string };

function Orbs3D({ progress, labels, theme, className, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = host.current!;
    const root = el.closest(".he") as HTMLElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = new THREE.WebGLRenderer({ antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(r.domElement);
    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r);
    const env = pm.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.7;
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    cam.position.set(0, 0.25, 8.2);

    const target = perfumes[1]; // Poids d'or: the bottle the three essences fill
    const bottle = new MorphBottle();
    bottle.set(target.bottle, target.bottle, 0, target.juice);
    bottle.group.scale.setScalar(0.74);
    scene.add(bottle.group);
    bottle.liquid.geometry.computeBoundingBox();
    const liquidFloor = bottle.liquid.geometry.boundingBox!.min.y;
    const liquidMat = bottle.liquid.material as THREE.MeshPhysicalMaterial;
    const neckTop = new THREE.Vector3(0, 0.25, 0); // the shoulder, just under the cap

    const orbs = ESSENCES.map((e, i) => {
      const grp = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 48, 32),
        new THREE.MeshPhysicalMaterial({ color: e.color, emissive: e.color, emissiveIntensity: 0.55, roughness: 0.15, clearcoat: 1 }),
      );
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(e.color), transparent: true, depthWrite: false }));
      halo.scale.setScalar(2.4);
      const light = new THREE.PointLight(e.color, 6, 6);
      grp.add(halo, core, light);
      scene.add(grp);
      return { grp, halo, base: (i / 3) * Math.PI * 2 };
    });

    const retheme = () => {
      const css = getComputedStyle(root);
      scene.background = new THREE.Color(css.getPropertyValue("--bg").trim() || "#eeeeec");
      const dark = document.documentElement.dataset.theme === "dark";
      orbs.forEach((o) => {
        const m = o.halo.material as THREE.SpriteMaterial;
        m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        m.opacity = dark ? 0.9 : 0.55;
        m.needsUpdate = true;
      });
    };
    api.current = retheme;
    retheme();

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
      // wide screens: the flacon lives on the right, the headline owns the left
      cam.setViewOffset(w, h, w / h > 1.2 ? -w * 0.2 : 0, w / h > 1.2 ? 0 : h * 0.08, w, h);
    });
    ro.observe(el);
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);

    const mix = new THREE.Color(), tmp = new THREE.Color(), v = new THREE.Vector3();
    let sp = 0, raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      sp += ((progress.current ?? 0) - sp) * (reduce ? 1 : 0.08);
      const t = reduce ? 0 : now / 1000;
      const pull = smooth(0.05, 0.8, sp);
      const fill = reduce ? 1 : smooth(0.3, 0.95, sp);

      orbs.forEach((o, i) => {
        const a = o.base + t * 0.35 + sp * Math.PI * 3;
        const rad = 2.5 * (1 - pull);
        const p = new THREE.Vector3(Math.cos(a) * rad, Math.sin(a * 1.3 + i) * 0.7 * (1 - pull), Math.sin(a) * rad * 0.6).lerp(neckTop, pull * pull);
        o.grp.position.copy(p);
        const s = 1 - smooth(0.7, 0.92, sp);
        o.grp.scale.setScalar(Math.max(0.0001, s));
        o.grp.visible = s > 0.01;
        const tag = labels.current?.[i];
        if (tag) {
          v.copy(p).project(cam);
          const x = (v.x * 0.5 + 0.5) * el.clientWidth, y = (-v.y * 0.5 + 0.5) * el.clientHeight;
          tag.style.transform = `translate3d(${x + 22}px, ${y - 10}px, 0)`;
          tag.style.opacity = String(Math.max(0, 1 - pull * 1.6));
        }
      });

      // juice: the three essences blended, settling into the perfume's own colour as it fills
      mix.set(ESSENCES[0].color).lerp(tmp.set(ESSENCES[2].color), 0.5).lerp(tmp.set(ESSENCES[1].color), 0.5).lerp(tmp.set(target.juice), fill);
      liquidMat.color.copy(mix);
      bottle.liquid.scale.y = Math.max(0.001, fill);
      bottle.liquid.position.y = liquidFloor * (1 - fill);
      bottle.liquid.visible = fill > 0.002;
      bottle.group.rotation.y = (reduce ? 0.6 : t * 0.22) + sp * 1.6;
      r.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      orbs.forEach((o) => o.grp.traverse((c) => {
        const m = c as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.SpriteMaterial | undefined;
        mat?.map?.dispose(); mat?.dispose();
      }));
      bottle.dispose(); env.dispose(); pm.dispose(); r.dispose(); el.removeChild(r.domElement); api.current = null;
    };
  }, [progress, labels]);

  useEffect(() => { requestAnimationFrame(() => api.current?.()); }, [theme]);
  return <div ref={host} role="img" aria-label={label} className={className} />;
}

export default memo(Orbs3D);
