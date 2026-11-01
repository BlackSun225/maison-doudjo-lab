// Parametric, morphable perfume bottle (glass shell + liquid + neck + cap) built from `Bottle` data.
// Every bottle samples to the same vertex layout, so any two can be blended per frame.
import * as THREE from "three";
import type { Bottle } from "./content";

const BODY_SAMPLES = 48; // points along the silhouette
const SEG = 96; // points around

type Sampled = { ys: number[]; rs: number[]; n: number; depth: number; height: number };

function smoothProfile(profile: [number, number][], t: number) {
  // cosine interpolation between control points: soft, no overshoot
  for (let i = 0; i < profile.length - 1; i++) {
    const [t0, r0] = profile[i], [t1, r1] = profile[i + 1];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0 || 1);
      const k = (1 - Math.cos(u * Math.PI)) / 2;
      return r0 + (r1 - r0) * k;
    }
  }
  return profile[profile.length - 1][1];
}

/** Silhouette as (y, r) pairs: bottom centre, rounded bottom edge, body, shoulder into neck, top centre. */
function sample(b: Bottle, scale = 1, fill = 1): Sampled {
  const ys: number[] = [], rs: number[] = [];
  const h = b.height * fill;
  const y0 = -b.height / 2 + (1 - scale) * 0.12;
  ys.push(y0); rs.push(0);
  for (let i = 0; i < BODY_SAMPLES; i++) {
    const t = i / (BODY_SAMPLES - 1);
    // ease the first/last few samples toward the edge to round bottom and shoulder
    const edge = Math.min(1, t / 0.035) ** 0.5;
    ys.push(y0 + t * (h - (1 - scale) * 0.12));
    rs.push(smoothProfile(b.profile, t) * scale * (0.86 + 0.14 * edge));
  }
  ys.push(y0 + h + 0.04 * scale); rs.push(fill < 1 ? 0 : b.neck.r * scale);
  ys.push(y0 + h + 0.04 * scale); rs.push(0);
  return { ys, rs, n: b.square, depth: b.depth, height: b.height };
}

function lerpSampled(a: Sampled, b: Sampled, t: number): Sampled {
  return {
    ys: a.ys.map((y, i) => y + (b.ys[i] - y) * t),
    rs: a.rs.map((r, i) => r + (b.rs[i] - r) * t),
    n: a.n + (b.n - a.n) * t,
    depth: a.depth + (b.depth - a.depth) * t,
    height: a.height + (b.height - a.height) * t,
  };
}

function makeSweep(): THREE.BufferGeometry {
  const rows = BODY_SAMPLES + 3;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(rows * (SEG + 1) * 3), 3));
  const idx: number[] = [];
  for (let r = 0; r < rows - 1; r++)
    for (let s = 0; s < SEG; s++) {
      const a = r * (SEG + 1) + s, b = a + SEG + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  g.setIndex(idx);
  return g;
}

function writeSweep(g: THREE.BufferGeometry, s: Sampled) {
  const pos = g.attributes.position as THREE.BufferAttribute;
  const e = 2 / Math.max(2, s.n);
  let k = 0;
  for (let r = 0; r < s.ys.length; r++) {
    for (let j = 0; j <= SEG; j++) {
      const th = (j / SEG) * Math.PI * 2;
      const c = Math.cos(th), sn = Math.sin(th);
      const x = Math.sign(c) * Math.abs(c) ** e * s.rs[r];
      const z = Math.sign(sn) * Math.abs(sn) ** e * s.rs[r] * s.depth;
      pos.setXYZ(k++, x, s.ys[r], z);
    }
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
}

function capProfile(h: number, r: number, round: number) {
  const pts: THREE.Vector2[] = [];
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const a = i / N;
    const box = a < 0.9 ? r : r * Math.cos(((a - 0.9) / 0.1) * (Math.PI / 2)); // cylinder with soft top edge
    const ball = r * Math.sin(Math.PI * Math.max(0.04, a)); // sphere
    pts.push(new THREE.Vector2(Math.max(0.001, box + (ball - box) * round), a * h));
  }
  return pts;
}

/** Front-view outline of a bottle as an SVG path (y down), from the same data as the 3D model. */
export function bottlePath(b: Bottle, unit = 100) {
  const pts: [number, number][] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push([smoothProfile(b.profile, t) * unit, -t * b.height * unit]);
  }
  const top = -b.height * unit;
  const nr = b.neck.r * unit, nh = b.neck.h * unit;
  const cr = b.cap.r * unit, ch = b.cap.h * unit;
  const right = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L");
  const left = [...pts].reverse().map(([x, y]) => `${(-x).toFixed(1)},${y.toFixed(1)}`).join(" L");
  const body = `M0,0 L${right} L${nr},${top - 4} L${nr},${top - nh} L${-nr},${top - nh} L${-nr},${top - 4} L${left} Z`;
  const capTop = top - nh - ch;
  const k = b.cap.round;
  const cap = k > 0.5
    ? `M${-cr},${top - nh - ch / 2} A${cr},${ch / 2} 0 1 1 ${cr},${top - nh - ch / 2} A${cr},${ch / 2} 0 1 1 ${-cr},${top - nh - ch / 2} Z`
    : `M${-cr},${top - nh} L${-cr},${capTop + 3} Q${-cr},${capTop} ${-cr + 3},${capTop} L${cr - 3},${capTop} Q${cr},${capTop} ${cr},${capTop + 3} L${cr},${top - nh} Z`;
  return { body, cap, height: b.height * unit + nh + ch, width: Math.max(...pts.map((p) => p[0]), cr) * 2 };
}

export class MorphBottle {
  group = new THREE.Group();
  glass: THREE.Mesh;
  liquid: THREE.Mesh;
  neck: THREE.Mesh;
  cap: THREE.Mesh;
  private glassGeo = makeSweep();
  private liquidGeo = makeSweep();
  private ca = new THREE.Color();
  private cb = new THREE.Color();

  constructor() {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transmission: 1, thickness: 0.9, roughness: 0.03, ior: 1.5,
      clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, envMapIntensity: 1.2,
      attenuationColor: new THREE.Color("#f4f6ff"), attenuationDistance: 4,
    });
    this.glass = new THREE.Mesh(this.glassGeo, glassMat);
    this.liquid = new THREE.Mesh(
      this.liquidGeo,
      new THREE.MeshPhysicalMaterial({ color: 0xc48a2a, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6, specularIntensity: 1 }),
    );
    this.neck = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48), glassMat);
    this.cap = new THREE.Mesh(
      new THREE.LatheGeometry(capProfile(0.5, 0.3, 0), 72),
      new THREE.MeshPhysicalMaterial({ color: 0x333333, roughness: 0.32, metalness: 0, clearcoat: 0.6 }),
    );
    this.group.add(this.liquid, this.glass, this.neck, this.cap);
  }

  /** Blend bottle a -> b by t (0..1) and set the juice colour. */
  set(a: Bottle, b: Bottle, t: number, juice: THREE.ColorRepresentation) {
    const s = lerpSampled(sample(a), sample(b), t);
    writeSweep(this.glassGeo, s);
    writeSweep(this.liquidGeo, lerpSampled(sample(a, 0.86, 0.72), sample(b, 0.86, 0.72), t));
    (this.liquid.material as THREE.MeshPhysicalMaterial).color.set(juice);

    const top = s.ys[s.ys.length - 1];
    const nh = a.neck.h + (b.neck.h - a.neck.h) * t, nr = a.neck.r + (b.neck.r - a.neck.r) * t;
    this.neck.scale.set(nr, nh, nr * s.depth ** 0.25);
    this.neck.position.y = top + nh / 2 - 0.01;

    const ch = a.cap.h + (b.cap.h - a.cap.h) * t, cr = a.cap.r + (b.cap.r - a.cap.r) * t;
    const round = a.cap.round + (b.cap.round - a.cap.round) * t;
    this.cap.geometry.dispose();
    this.cap.geometry = new THREE.LatheGeometry(capProfile(ch, cr, round), 72);
    this.cap.position.y = top + nh - 0.02;
    const cm = this.cap.material as THREE.MeshPhysicalMaterial;
    cm.color.copy(this.ca.set(a.cap.color).lerp(this.cb.set(b.cap.color), t));
    cm.metalness = a.cap.metal + (b.cap.metal - a.cap.metal) * t;
    cm.roughness = 0.45 - cm.metalness * 0.25;
    // keep the whole flacon (body bottom to cap top) vertically centred whatever its height
    this.group.position.y = -(-s.height / 2 + top + nh + ch) / 2;
  }

  dispose() {
    this.glassGeo.dispose(); this.liquidGeo.dispose(); this.neck.geometry.dispose(); this.cap.geometry.dispose();
    [this.glass, this.liquid, this.cap].forEach((m) => (m.material as THREE.Material).dispose());
  }
}
