"use client";
// One still per flacon for each theme (glass refracts its background, so light and dark need their own renders).
import { useEffect, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MorphBottle } from "@/lib/bottle3d";
import { perfumes } from "@/lib/content";

type Shots = { light: string[]; dark: string[] };

function glow(bg: string, juice: string, strength: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const base = new THREE.Color(bg);
  const mid = "#" + base.clone().lerp(new THREE.Color(juice), strength).getHexString();
  const r = g.createRadialGradient(256, 300, 10, 256, 280, 330);
  r.addColorStop(0, mid);
  r.addColorStop(1, bg);
  g.fillStyle = r;
  g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function useShots(w = 760, h = 760) {
  const [shots, setShots] = useState<Shots | null>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    r.setSize(w, h, false);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r);
    const env = pm.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    const cam = new THREE.PerspectiveCamera(28, w / h, 0.1, 50);
    cam.position.set(0, 0.15, 7.6);
    const bottle = new MorphBottle();
    bottle.group.rotation.y = 0.5;
    bottle.group.scale.setScalar(0.92);
    scene.add(bottle.group);
    const out: Shots = { light: [], dark: [] };
    for (const [mode, bg, k] of [["light", "#f3f3f1", 0.32], ["dark", "#0b0b0c", 0.42]] as const) {
      for (const p of perfumes) {
        const tex = glow(bg, mode === "dark" ? p.juiceDark : p.juice, k);
        scene.background = tex;
        bottle.set(p.bottle, p.bottle, 0, p.juice);
        r.render(scene, cam);
        out[mode].push(canvas.toDataURL("image/webp", 0.9));
        tex.dispose();
      }
    }
    setShots(out);
    bottle.dispose(); env.dispose(); pm.dispose(); r.dispose();
  }, [w, h]);
  return shots;
}
