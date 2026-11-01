"use client";
// Isolated Three.js leaves (no Motion, no GSAP inside).
//  - Shelf3D: the five flacons on a lacquered shelf; `progress` (curtain opening) dollies the camera in.
//  - useShots: one still per flacon, used as product imagery in the horizontal pan.
import { memo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MorphBottle } from "@/lib/bottle3d";
import { perfumes } from "@/lib/content";

function room(r: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  const env = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;
  const key = new THREE.SpotLight(0xfff1dc, 60, 30, 0.6, 0.6);
  key.position.set(-2, 7, 6);
  scene.add(key, key.target);
  return { scene, key, dispose: () => { env.dispose(); pm.dispose(); } };
}

export const Shelf3D = memo(function Shelf3D({ progress, theme, className, label }: { progress: React.RefObject<number>; theme: string; className?: string; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = host.current!;
    const root = el.closest(".dt") as HTMLElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = new THREE.WebGLRenderer({ antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(r.domElement);
    const { scene, dispose } = room(r);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 80);

    const floorMat = new THREE.MeshPhysicalMaterial({ color: 0x0f2a22, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.32;
    scene.add(floor);

    const bottles = perfumes.map((p, i) => {
      const b = new MorphBottle();
      b.set(p.bottle, p.bottle, 0, p.juice);
      const holder = new THREE.Group();
      holder.add(b.group);
      holder.scale.setScalar(0.72);
      holder.position.x = (i - 2) * 1.75;
      scene.add(holder);
      // seat every flacon on the shelf whatever its height
      holder.updateMatrixWorld(true);
      holder.position.y = floor.position.y - new THREE.Box3().setFromObject(holder).min.y + 0.001;
      return { b, holder };
    });

    const retheme = () => {
      const css = getComputedStyle(root);
      const bg = new THREE.Color(css.getPropertyValue("--bg").trim() || "#eef0ea");
      scene.background = bg;
      scene.fog = new THREE.Fog(bg, 9, 22);
      floorMat.color.set(css.getPropertyValue("--bg-2").trim() || "#e4e8df");
    };
    api.current = retheme;
    retheme();

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
    });
    ro.observe(el);
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);

    let sp = 0, raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      sp += ((progress.current ?? 0) - sp) * (reduce ? 1 : 0.08);
      const e = sp * sp * (3 - 2 * sp);
      // from a close look at the centre flacon to the whole shelf as the curtain opens
      const fit = cam.aspect < 1 ? 1.7 : 1;
      cam.position.set(Math.sin(e * 0.5) * 1.2, 0.5 + e * 0.8, (8.2 + e * 4.6) * fit);
      cam.lookAt(0, -0.1 - e * 0.2, 0);
      bottles.forEach(({ holder }, i) => {
        holder.rotation.y = (reduce ? 0.5 : now / 5200 + i) * (i % 2 ? -1 : 1);
      });
      r.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      bottles.forEach(({ b }) => b.dispose()); floor.geometry.dispose(); floorMat.dispose(); dispose(); r.dispose();
      el.removeChild(r.domElement); api.current = null;
    };
  }, [progress]);

  useEffect(() => { requestAnimationFrame(() => api.current?.()); }, [theme]);
  return <div ref={host} role="img" aria-label={label} className={className} />;
});

/** Product stills: each flacon on a soft tint of its own juice, with a floor shadow. */
export function useShots(w = 720, h = 900) {
  const [shots, setShots] = useState<string[] | null>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    r.setSize(w, h, false);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.shadowMap.enabled = true;
    const { scene, key, dispose } = room(r);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    const cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 50);
    cam.position.set(0, 0.9, 8);
    cam.lookAt(0, -0.1, 0);
    const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.18;
    floor.receiveShadow = true;
    scene.add(floor);
    const bottle = new MorphBottle();
    bottle.group.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
    const holder = new THREE.Group();
    holder.add(bottle.group);
    holder.scale.setScalar(0.85);
    holder.rotation.y = 0.5;
    scene.add(holder);
    const out: string[] = [];
    for (const p of perfumes) {
      const tint = new THREE.Color("#eef0ea").lerp(new THREE.Color(p.juice), 0.28);
      scene.background = tint;
      floorMat.color.copy(tint).multiplyScalar(0.96);
      bottle.set(p.bottle, p.bottle, 0, p.juice);
      r.render(scene, cam);
      out.push(canvas.toDataURL("image/webp", 0.9));
    }
    setShots(out);
    bottle.dispose(); floor.geometry.dispose(); floorMat.dispose(); dispose(); r.dispose();
  }, [w, h]);
  return shots;
}
