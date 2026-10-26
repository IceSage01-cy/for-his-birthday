import { useEffect, useRef, useState } from "react";

// A bouquet of lilies and lily of the valley, drawn on a hidden canvas and shown as glowing 1s and 0s.

const W0 = 1000; // world units of the drawing
const H0 = 1250;
const GAP = "#050407"; // colour of the dark outline gaps
const BG_R = 5;
const BG_G = 4;
const BG_B = 7;
const BG_PIXEL = ((255 << 24) | (BG_B << 16) | (BG_G << 8) | BG_R) >>> 0; // the dark background as one pixel

// Shared with the bell colour buttons and the pointer, which blows the flowers about a little.
const view = { tone: "blue", wind: 0 };

const PAL = {
  red: { th: "#ffd36b", mid: "#e0322a", tip: "#8e1612", spot: "#4a0606", anth: "#6e2c0c" },
  white: { th: "#d9ec8a", mid: "#f6efe6", tip: "#d6c6bc", spot: "#b89a8a", anth: "#a8561c" },
  yellow: { th: "#fff3a8", mid: "#f3c22e", tip: "#c4840e", spot: "#9a4c08", anth: "#7a3a10" },
  magenta: { th: "#ffd2f2", mid: "#bf3daf", tip: "#6e1a62", spot: "#40083a", anth: "#6a2a10" },
  pink: { th: "#fff0fc", mid: "#e472dc", tip: "#a43c9c", spot: "#701a66", anth: "#8a3a14" },
  peach: { th: "#fff3cf", mid: "#f7c39a", tip: "#e8946a", spot: "#a84a26", anth: "#8a4416" },
  burgundy: { th: "#f2a45c", mid: "#b0222c", tip: "#621018", spot: "#320306", anth: "#5a2408" },
};

// Lily of the valley bell colours
const BELLS = {
  white: { hi: "#ffffff", mid: "#eef3e8", lo: "#9cb091", rib: "rgba(110,135,100,0.55)", mouth: "#465a40", b1: "#f2f6dc", b2: "#93b66c" },
  blue: { hi: "#eaf3ff", mid: "#a6ceff", lo: "#3f78e0", rib: "rgba(25,60,160,0.55)", mouth: "#14244f", b1: "#d6e8ff", b2: "#5b8fe0" },
};

// Back to front, packed tight like a real bouquet
const FLOWERS = [
  { x: 300, y: 290, r: 215, rot: -0.5, tilt: 0.84, pal: "white", d: 1.2 },
  { x: 720, y: 270, r: 195, rot: 0.4, tilt: 0.8, pal: "yellow", d: 1.35 },
  { x: 640, y: 110, r: 120, rot: 0.1, tilt: 0.75, pal: "burgundy", d: 1.1 },
  { x: 510, y: 380, r: 265, rot: 0.15, tilt: 0.88, pal: "red", d: 1.0 },
  { x: 760, y: 590, r: 225, rot: 0.9, tilt: 0.84, pal: "magenta", d: 1.5 },
  { x: 250, y: 640, r: 230, rot: -0.9, tilt: 0.84, pal: "yellow", d: 1.6 },
  { x: 390, y: 620, r: 215, rot: -0.4, tilt: 0.84, pal: "pink", d: 1.65 },
  { x: 215, y: 910, r: 195, rot: -0.3, tilt: 0.8, pal: "yellow", d: 1.9 },
  { x: 800, y: 900, r: 195, rot: 0.6, tilt: 0.82, pal: "burgundy", d: 1.95 },
  { x: 590, y: 730, r: 275, rot: -0.2, tilt: 0.88, pal: "white", d: 1.75 },
  { x: 500, y: 960, r: 225, rot: 0.35, tilt: 0.82, pal: "peach", d: 2.1 },
];
const BUDS = [
  { x: 400, y: 90, len: 130, rot: -0.2, pal: "white", d: 0.8 },
  { x: 510, y: 70, len: 140, rot: 0.05, pal: "red", d: 0.9 },
];
// Lily of the valley sprays: start (tucked into the bouquet), bend point, tip
const SPRAYS = [
  { s: [330, 215], c: [185, 15], t: [55, 135], n: 6, d: 2.3, ph: 0.4 },
  { s: [690, 175], c: [835, 0], t: [950, 115], n: 6, d: 2.45, ph: 1.9 },
  { s: [175, 560], c: [45, 430], t: [30, 650], n: 5, d: 2.6, ph: 3.1 },
  { s: [850, 545], c: [985, 425], t: [985, 640], n: 5, d: 2.7, ph: 4.2 },
  { s: [300, 1010], c: [140, 885], t: [50, 1060], n: 5, d: 2.85, ph: 5.0 },
  { s: [700, 1030], c: [875, 905], t: [955, 1080], n: 5, d: 2.95, ph: 5.9 },
];
const LEAVES = [];
for (let i = 0; i < 16; i++) {
  const a = -0.85 + i * 0.113;
  LEAVES.push({ bx: 500 + a * 80, ang: a + (i % 2 ? 0.08 : -0.08), len: 260 + ((i * 53) % 190), wid: 24 + (i % 3) * 7, bend: (i % 2 ? 1 : -1) * 45, ph: i });
}

function mulberry(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
FLOWERS.forEach((f, i) => {
  const rand = mulberry(i * 977 + 13);
  f.ph = rand() * 6.28;
  f.spots = [];
  for (let k = 0; k < 24; k++) f.spots.push([rand(), rand(), rand()]);
});
BUDS.forEach((b, i) => {
  b.ph = i * 1.7;
});

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeBack = (x) => {
  const c = 1.4;
  x = clamp(x);
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const qpt = (a, c, b, u) => {
  const v = 1 - u;
  return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]];
};

// Long, narrow lily petal with a pointed, recurved tip
function petal(g, len, wid, pal, curl, spots, sScale) {
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(wid * 0.9, len * 0.18, wid * 1.05, len * 0.55, curl + wid * 0.12, len * 0.92);
  g.quadraticCurveTo(curl + wid * 0.05, len * 1.02, curl * 1.25, len * 1.04);
  g.quadraticCurveTo(curl - wid * 0.15, len * 0.96, curl - wid * 0.25, len * 0.86);
  g.bezierCurveTo(-wid * 0.85, len * 0.55, -wid * 0.9, len * 0.2, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, len);
  gr.addColorStop(0, pal.th);
  gr.addColorStop(0.28, pal.mid);
  gr.addColorStop(0.78, pal.mid);
  gr.addColorStop(1, pal.tip);
  g.fillStyle = gr;
  g.fill();
  g.strokeStyle = "rgba(8,2,8,0.9)";
  g.lineWidth = Math.max(5, wid * 0.08);
  g.lineJoin = "round";
  g.stroke();
  g.strokeStyle = "rgba(0,0,0,0.3)";
  g.lineWidth = wid * 0.05;
  for (const sd of [-1, 1]) {
    g.beginPath();
    g.moveTo(sd * wid * 0.08, len * 0.12);
    g.quadraticCurveTo(sd * wid * 0.5 + curl * 0.2, len * 0.5, curl * 0.6 + sd * wid * 0.15, len * 0.85);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(0, len * 0.05);
  g.quadraticCurveTo(curl * 0.2, len * 0.5, curl * 0.8, len * 0.92);
  g.strokeStyle = "rgba(255,255,235,0.55)";
  g.lineWidth = wid * 0.12;
  g.stroke();
  if (spots) {
    g.fillStyle = pal.spot;
    for (const s of spots) {
      g.beginPath();
      g.arc((s[0] - 0.5) * wid * 0.8, len * (0.12 + s[1] * 0.4), sScale * (0.6 + s[2]), 0, 6.283);
      g.fill();
    }
  }
}

function lily(g, f, x, y, rot, p) {
  if (p <= 0.001) return;
  const pal = PAL[f.pal];
  const r = f.r;
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(1, f.tilt);
  g.scale(p, p);
  for (let k = 0; k < 3; k++) {
    g.save();
    g.rotate(k * 2.094 + 1.047);
    petal(g, r * 0.95, r * 0.31, pal, (k % 2 ? 1 : -1) * r * 0.12, null, 0);
    g.restore();
  }
  for (let k = 0; k < 3; k++) {
    g.save();
    g.rotate(k * 2.094);
    petal(g, r, r * 0.28, pal, (k % 2 ? -1 : 1) * r * 0.13, f.spots.slice(k * 8, k * 8 + 8), r * 0.015);
    g.restore();
  }
  // stamens and pistil
  g.lineCap = "round";
  for (let k = 0; k < 6; k++) {
    const a = k * 1.047 + 0.5;
    const len = r * (0.5 + (k % 3) * 0.06);
    const ex = Math.sin(a) * len;
    const ey = Math.cos(a) * len;
    g.strokeStyle = "#e3ecb8";
    g.lineWidth = r * 0.02;
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(ex * 0.5, ey * 0.3, ex, ey);
    g.stroke();
    g.fillStyle = pal.anth;
    g.beginPath();
    g.ellipse(ex, ey, r * 0.06, r * 0.026, a, 0, 6.283);
    g.fill();
  }
  g.strokeStyle = "#a6cf62";
  g.lineWidth = r * 0.032;
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(r * 0.06, r * 0.6);
  g.stroke();
  g.fillStyle = "#d2e886";
  g.beginPath();
  g.arc(r * 0.06, r * 0.6, r * 0.04, 0, 6.283);
  g.fill();
  g.restore();
}

function bud(g, b, x, y, p) {
  if (p <= 0.001) return;
  const pal = PAL[b.pal];
  const len = b.len * p;
  const w = b.len * 0.2 * p;
  g.save();
  g.translate(x, y);
  g.rotate(b.rot);
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(w * 1.3, -len * 0.3, w * 0.6, -len * 0.8, 0, -len);
  g.bezierCurveTo(-w * 0.6, -len * 0.8, -w * 1.3, -len * 0.3, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, -len);
  gr.addColorStop(0, "#5f9a3e");
  gr.addColorStop(0.45, "#8fbf55");
  gr.addColorStop(1, pal.mid);
  g.fillStyle = gr;
  g.fill();
  g.strokeStyle = "rgba(8,2,8,0.85)";
  g.lineWidth = 5;
  g.stroke();
  g.restore();
}

function leaf(g, l, sway) {
  g.save();
  g.translate(l.bx, 1270);
  g.rotate(l.ang + sway);
  const len = l.len;
  const w = l.wid;
  g.beginPath();
  g.moveTo(-w * 0.3, 0);
  g.quadraticCurveTo(w, -len * 0.5, l.bend, -len);
  g.quadraticCurveTo(-w * 0.2, -len * 0.5, -w * 0.9, 0);
  const gr = g.createLinearGradient(0, 0, 0, -len);
  gr.addColorStop(0, "#2c6b2a");
  gr.addColorStop(0.6, "#5fae45");
  gr.addColorStop(1, "#b4e07a");
  g.fillStyle = gr;
  g.fill();
  g.strokeStyle = "rgba(8,2,8,0.7)";
  g.lineWidth = 4;
  g.stroke();
  g.restore();
}

// One hanging bell: rounded dome, six lobes with tips curling out, ribs, highlight, stamens
function valleyBell(g, x, y, r, a, tone) {
  if (r <= 0.5) return;
  g.save();
  g.translate(x, y);
  g.rotate(a);
  const body = new Path2D();
  body.moveTo(-r * 0.72, r * 1.18);
  body.bezierCurveTo(-r * 0.9, r * 0.15, -r * 0.5, -r * 0.02, 0, -r * 0.02);
  body.bezierCurveTo(r * 0.5, -r * 0.02, r * 0.9, r * 0.15, r * 0.72, r * 1.18);
  body.quadraticCurveTo(r * 0.9, r * 1.38, r * 1.16, r * 1.34);
  body.quadraticCurveTo(r * 1.0, r * 1.6, r * 0.62, r * 1.52);
  body.quadraticCurveTo(r * 0.5, r * 1.78, r * 0.3, r * 1.56);
  body.quadraticCurveTo(r * 0.15, r * 1.82, 0, r * 1.58);
  body.quadraticCurveTo(-r * 0.15, r * 1.82, -r * 0.3, r * 1.56);
  body.quadraticCurveTo(-r * 0.5, r * 1.78, -r * 0.62, r * 1.52);
  body.quadraticCurveTo(-r * 1.0, r * 1.6, -r * 1.16, r * 1.34);
  body.quadraticCurveTo(-r * 0.9, r * 1.38, -r * 0.72, r * 1.18);
  body.closePath();

  g.strokeStyle = GAP;
  g.lineWidth = Math.max(6, r * 0.24);
  g.lineJoin = "round";
  g.stroke(body);
  const gr = g.createLinearGradient(-r, 0, r, r * 0.4);
  gr.addColorStop(0, tone.hi);
  gr.addColorStop(0.45, tone.mid);
  gr.addColorStop(1, tone.lo);
  g.fillStyle = gr;
  g.fill(body);

  g.save();
  g.clip(body);
  g.strokeStyle = tone.rib;
  g.lineWidth = r * 0.07;
  for (const k of [-0.5, -0.18, 0.18, 0.5]) {
    g.beginPath();
    g.moveTo(k * r * 0.35, r * 0.12);
    g.quadraticCurveTo(k * r * 1.25, r * 0.8, k * r * 1.45, r * 1.62);
    g.stroke();
  }
  g.beginPath();
  g.ellipse(-r * 0.36, r * 0.55, r * 0.17, r * 0.38, -0.2, 0, 6.283);
  g.fillStyle = "rgba(255,255,255,0.95)";
  g.fill();
  g.restore();

  g.beginPath();
  g.ellipse(0, r * 1.5, r * 0.55, r * 0.13, 0, 0, 6.283);
  g.fillStyle = tone.mouth;
  g.fill();
  g.fillStyle = "#e8d870";
  for (const k of [-0.22, 0, 0.22]) {
    g.beginPath();
    g.arc(k * r, r * 1.53, r * 0.07, 0, 6.283);
    g.fill();
  }
  g.beginPath();
  g.ellipse(0, r * 0.04, r * 0.24, r * 0.12, 0, 0, 6.283);
  g.fillStyle = "#7fb069";
  g.fill();
  g.restore();
}

// Closed bud at the tip of each spray
function valleyBud(g, x, y, r, a, tone) {
  if (r <= 0.5) return;
  g.save();
  g.translate(x, y);
  g.rotate(a);
  const shape = new Path2D();
  shape.ellipse(0, r * 0.95, r * 0.62, r * 0.88, 0, 0, 6.283);
  g.strokeStyle = GAP;
  g.lineWidth = Math.max(5, r * 0.22);
  g.stroke(shape);
  const gr = g.createLinearGradient(-r, 0, r, r);
  gr.addColorStop(0, tone.b1);
  gr.addColorStop(1, tone.b2);
  g.fillStyle = gr;
  g.fill(shape);
  g.save();
  g.clip(shape);
  g.strokeStyle = tone.rib;
  g.lineWidth = r * 0.08;
  g.beginPath();
  g.moveTo(0, r * 0.1);
  g.lineTo(0, r * 1.8);
  g.stroke();
  g.restore();
  g.beginPath();
  g.ellipse(0, r * 0.1, r * 0.25, r * 0.12, 0, 0, 6.283);
  g.fillStyle = "#7fb069";
  g.fill();
  g.restore();
}

function swayOf(y, ph, t) {
  const h = (H0 - y) / H0;
  return (Math.sin(t * 0.8 + ph) * 0.8 + Math.sin(t * 0.37 + ph * 2) * 0.4 + view.wind) * h * 20;
}

// An arching stem that grows out of the bouquet, then bells pop open one by one
function spray(g, sp, t) {
  const grow = easeOut((t - sp.d) / 1.1);
  if (grow <= 0.001) return;
  const sw = swayOf(sp.t[1], sp.ph, t);
  const s = [sp.s[0] + swayOf(sp.s[1], sp.ph, t) * 0.6, sp.s[1]];
  const c = [sp.c[0] + sw * 0.8, sp.c[1]];
  const e = [sp.t[0] + sw * 1.2, sp.t[1] + Math.abs(sw) * 0.2];
  const tone = BELLS[view.tone];

  const pts = [];
  for (let k = 0; k <= 30; k++) pts.push(qpt(s, c, e, (k / 30) * grow));

  const bells = [];
  for (let k = 0; k < sp.n; k++) {
    const f = k / (sp.n - 1);
    const u = 0.34 + f * 0.64;
    const pop = easeBack((t - sp.d - 0.35 - k * 0.14) / 0.8);
    if (u > grow || pop <= 0.001) continue;
    const p = qpt(s, c, e, u);
    const swing = Math.sin(t * 1.3 + sp.ph + k * 0.7) * 0.12 + view.wind * 0.05;
    const plen = (24 + (k % 2) * 24) * Math.min(1, pop);
    const ex = p[0] - Math.sin(swing) * plen;
    const ey = p[1] + Math.cos(swing) * plen;
    bells.push({ p, ex, ey, swing, r: (46 - f * 20) * pop, last: k === sp.n - 1 });
  }

  const stemPath = () => {
    g.beginPath();
    pts.forEach((p, k) => (k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  };
  const pedicel = (b) => {
    g.beginPath();
    g.moveTo(b.p[0], b.p[1]);
    g.quadraticCurveTo(b.p[0] + (b.ex - b.p[0]) * 1.5, b.p[1] + (b.ey - b.p[1]) * 0.3, b.ex, b.ey);
  };
  g.lineCap = "round";
  g.lineJoin = "round";
  // dark outline pass, then green pass, so the stems read cleanly over the lilies
  g.strokeStyle = GAP;
  stemPath();
  g.lineWidth = 15;
  g.stroke();
  bells.forEach((b) => {
    pedicel(b);
    g.lineWidth = 10;
    g.stroke();
  });
  stemPath();
  g.strokeStyle = "#79b45c";
  g.lineWidth = 7;
  g.stroke();
  g.strokeStyle = "#8cc06c";
  bells.forEach((b) => {
    pedicel(b);
    g.lineWidth = 4;
    g.stroke();
  });
  bells.forEach((b) => (b.last ? valleyBud(g, b.ex, b.ey, b.r * 0.8, b.swing, tone) : valleyBell(g, b.ex, b.ey, b.r, b.swing, tone)));
}

function drawScene(g, t) {
  const grow = easeOut(t / 1.4);
  g.save();
  g.beginPath();
  g.rect(-200, H0 * (1 - grow) - 20, W0 + 400, H0 + 60);
  g.clip();
  LEAVES.forEach((l) => leaf(g, l, Math.sin(t * 0.9 + l.ph) * 0.03 + view.wind * 0.02));
  g.lineCap = "round";
  const stem = (tx, ty, i) => {
    const bx = 470 + (i % 8) * 8;
    const by = 1270;
    g.strokeStyle = i % 2 ? "#4f8f36" : "#3f7d2e";
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(bx, by);
    g.quadraticCurveTo((bx + tx) / 2 + (tx - bx) * 0.15, (by + ty) / 2 + 80, tx, ty);
    g.stroke();
  };
  BUDS.forEach((b, i) => stem(b.x + swayOf(b.y, b.ph, t), b.y + 10, i));
  FLOWERS.forEach((f, i) => stem(f.x + swayOf(f.y, f.ph, t), f.y, i + 4));
  g.restore();
  BUDS.forEach((b) => bud(g, b, b.x + swayOf(b.y, b.ph, t), b.y + 10, easeBack((t - b.d) / 1.2)));
  FLOWERS.forEach((f) => {
    const s = swayOf(f.y, f.ph, t);
    lily(g, f, f.x + s, f.y, f.rot + s * 0.004 + Math.sin(t * 0.5 + f.ph) * 0.03, easeBack((t - f.d) / 1.4));
  });
  SPRAYS.forEach((sp) => spray(g, sp, t));
}

// Fits the picture to the panel and turns it into 1s and 0s, about 26 times a second or fewer on a slow device.
// The digits are copied straight into the picture's pixels, which is far faster than writing text a cell at a time.
// Returns { stop, replay, redraw } for the buttons.
function startBouquet(canvas, stage) {
  const ctx = canvas.getContext("2d");
  const oc = document.createElement("canvas");
  const octx = oc.getContext("2d", { willReadFrequently: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cols = 0, rows = 0, cwPx = 3, chPx = 5, cellW = 3, cellH = 5, cssW = 0, cssH = 0;
  let scale = 1, offX = 0, offY = 0, outW = 0;
  let masks = [];
  let img = null;
  let L = new Float32Array(0);
  let CR = new Uint8Array(0);
  let CG = new Uint8Array(0);
  let CB = new Uint8Array(0);
  let CA = new Uint8Array(0);
  let rnd = new Float32Array(0);
  let startTime = performance.now();
  let last = 0;
  let interval = 38;
  let raf = 0;
  let lastWidth = 0;
  let observer = null;
  let stopped = false;

  // The look of a "0", a "1" and a "." in the font, as how much of each pixel they cover.
  function makeMasks() {
    const glyph = document.createElement("canvas");
    glyph.width = cwPx;
    glyph.height = chPx;
    const gctx = glyph.getContext("2d", { willReadFrequently: true });
    return ["0", "1", "."].map((chr) => {
      gctx.clearRect(0, 0, cwPx, chPx);
      gctx.font = `600 ${cwPx / 0.6}px "JetBrains Mono", ui-monospace, monospace`;
      gctx.textBaseline = "top";
      gctx.fillStyle = "#fff";
      gctx.fillText(chr, 0, 0);
      const d = gctx.getImageData(0, 0, cwPx, chPx).data;
      const mask = new Float32Array(cwPx * chPx);
      for (let i = 0; i < mask.length; i++) mask[i] = d[i * 4 + 3] / 255;
      return mask;
    });
  }

  function resize() {
    const availW = stage.clientWidth - 20;
    if (availW <= 0) return;
    lastWidth = stage.clientWidth;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const availH = Math.max(320, window.innerHeight * 0.7);
    scale = Math.min(availW / W0, availH / H0);
    const sceneW = W0 * scale;
    const sceneH = H0 * scale;
    const w = Math.min(availW, sceneW * 1.08);
    // Whole screen pixels per digit, so every digit is drawn the same and stays sharp.
    cwPx = Math.max(3, Math.round(Math.max(2.3, Math.min(3.3, sceneW / 240)) * dpr));
    chPx = Math.round((cwPx / 0.6) * 0.95);
    cellW = cwPx / dpr;
    cellH = chPx / dpr;
    cols = Math.floor(w / cellW);
    rows = Math.floor(sceneH / cellH);
    outW = cols * cwPx;
    cssW = outW / dpr;
    cssH = (rows * chPx) / dpr;
    offX = (cssW - sceneW) / 2;
    offY = (cssH - sceneH) / 2;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = outW;
    canvas.height = rows * chPx;
    img = ctx.createImageData(outW, rows * chPx);
    masks = makeMasks();
    oc.width = cols * 2;
    oc.height = rows * 2;
    const n = cols * rows;
    rnd = new Float32Array(n).map(() => Math.random()); // fixed per cell, so nothing flickers
    L = new Float32Array(n);
    CR = new Uint8Array(n);
    CG = new Uint8Array(n);
    CB = new Uint8Array(n);
    CA = new Uint8Array(n);
  }

  // Lays one digit into the picture's pixels, fading from the dark background to the colour.
  function blit(px, mask, c, r, R, G, B) {
    const x0 = c * cwPx;
    const y0 = r * chPx;
    for (let y = 0; y < chPx; y++) {
      let p = ((y0 + y) * outW + x0) * 4;
      let m = y * cwPx;
      for (let x = 0; x < cwPx; x++, p += 4, m++) {
        const a = mask[m];
        if (a < 0.02) continue;
        px[p] = BG_R + (R - BG_R) * a;
        px[p + 1] = BG_G + (G - BG_G) * a;
        px[p + 2] = BG_B + (B - BG_B) * a;
      }
    }
  }

  function render(t) {
    if (!cols) return;
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, oc.width, oc.height);
    const kx = 2 / cellW;
    const ky = 2 / cellH;
    octx.setTransform(scale * kx, 0, 0, scale * ky, offX * kx, offY * ky);
    drawScene(octx, t);
    const data = octx.getImageData(0, 0, oc.width, oc.height).data;
    const ow = oc.width;

    // pass 1: average the 2x2 pixels behind each cell (smooth colour, no sampling speckle)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        let sr = 0, sg = 0, sb = 0, sa = 0;
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const p = ((r * 2 + dy) * ow + c * 2 + dx) * 4;
            const a = data[p + 3];
            sr += data[p] * a;
            sg += data[p + 1] * a;
            sb += data[p + 2] * a;
            sa += a;
          }
        }
        const aAvg = sa / 4;
        CA[i] = aAvg;
        if (aAvg < 60) {
          L[i] = 0;
          continue;
        }
        const R = sr / sa, G = sg / sa, B = sb / sa;
        const lum = (0.299 * R + 0.587 * G + 0.114 * B) / 255;
        if (lum < 0.1) {
          L[i] = 0; // outlines stay as clean dark gaps
          continue;
        }
        L[i] = lum;
        CR[i] = R;
        CG[i] = G;
        CB[i] = B;
      }
    }

    // pass 2: a 1 or a 0 in every lit cell
    const px = img.data;
    new Uint32Array(px.buffer).fill(BG_PIXEL);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const q = rnd[i];
        if (L[i] === 0) {
          if (CA[i] < 60 && q < 0.004) blit(px, masks[2], c, r, 70, 66, 74); // a few still, faint stars
          continue;
        }
        const sh = CA[i] < 160 ? 0.8 : 1.05;
        blit(px, masks[q < 0.5 ? 0 : 1], c, r, Math.min(255, CR[i] * sh), Math.min(255, CG[i] * sh), Math.min(255, CB[i] * sh));
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // With reduced motion the bouquet is drawn once, fully bloomed.
  const redrawStill = () => render(12);

  function frame(now) {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    if (now - last < interval) return;
    last = now;
    view.wind *= 0.96;
    const began = performance.now();
    render((now - startTime) / 1000);
    // A slow device draws fewer frames, so the page stays quick to touch.
    interval = Math.max(38, (performance.now() - began) * 1.6);
  }

  function boot() {
    if (stopped) return;
    startTime = performance.now();
    resize();
    observer = new ResizeObserver(() => {
      if (stage.clientWidth === lastWidth) return;
      resize();
      if (reduce) redrawStill();
    });
    observer.observe(stage);
    if (reduce) redrawStill();
    else raf = requestAnimationFrame(frame);
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(boot, boot);

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
    },
    replay() {
      startTime = performance.now();
      if (reduce) redrawStill();
    },
    redraw() {
      if (reduce) redrawStill();
    },
  };
}

const css = `
  .lily { border: 1px solid #2a2533; border-radius: 10px; background: #050407; overflow: hidden; }
  .lily-stage { padding: 10px; }
  .lily canvas { display: block; margin: 0 auto; touch-action: pan-y; }
  .lily-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .lily-controls .seg { display: inline-flex; border: 1px solid #c4a3b0; border-radius: 8px; overflow: hidden; }
  .lily-controls button { min-height: 40px; padding: 0 14px; border: 1px solid #c4a3b0; border-radius: 8px; background: transparent; color: #5a3a4a; font-size: 0.85rem; font-family: inherit; cursor: pointer; }
  .lily-controls .seg button { border: 0; border-radius: 0; }
  .lily-controls .seg button + button { border-left: 1px solid #c4a3b0; }
  .lily-controls button[aria-pressed="true"] { background: #5a3a4a; color: #fff; }
`;

export default function LilyBouquet() {
  const canvas = useRef(null);
  const stage = useRef(null);
  const bouquet = useRef(null);
  const lastX = useRef(null);
  const [tone, setTone] = useState("blue");

  useEffect(() => {
    view.tone = "blue";
    view.wind = 0;
    bouquet.current = startBouquet(canvas.current, stage.current);
    return () => bouquet.current.stop();
  }, []);

  const pickTone = (next) => {
    view.tone = next;
    setTone(next);
    bouquet.current?.redraw();
  };

  // Sweeping a finger or the mouse across the bouquet sets the flowers swaying.
  const onPointerMove = (e) => {
    if (lastX.current !== null) view.wind = clamp(view.wind + (e.clientX - lastX.current) * 0.03, -2, 2);
    lastX.current = e.clientX;
  };

  return (
    <>
      <style>{css}</style>
      <div className="lily">
        <div className="lily-stage" ref={stage}>
          <canvas
            ref={canvas}
            role="img"
            aria-label="An animated bouquet of lilies with arching sprays of lily of the valley, made of 1s and 0s"
            onPointerMove={onPointerMove}
            onPointerLeave={() => {
              lastX.current = null;
            }}
          />
        </div>
      </div>
      <div className="lily-controls">
        <button onClick={() => bouquet.current?.replay()}>Replay bloom</button>
        <div className="seg" role="group" aria-label="Lily of the valley colour">
          <button aria-pressed={tone === "white"} onClick={() => pickTone("white")}>White bells</button>
          <button aria-pressed={tone === "blue"} onClick={() => pickTone("blue")}>Blue bells</button>
        </div>
      </div>
    </>
  );
}
