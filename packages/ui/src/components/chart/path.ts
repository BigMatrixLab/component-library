/** SVG path builders: curves, areas, bars and arcs. Pure functions, no DOM. */

export interface Point {
  x: number;
  y: number;
}
export type Curve = 'monotone' | 'linear' | 'step';

const r = (n: number) => Math.round(n * 100) / 100;
const pt = (x: number, y: number) => `${r(x)} ${r(y)}`;

/**
 * Fritsch-Carlson tangents: the curve never overshoots a data value, so a flat
 * run stays flat and a peak is never drawn higher than the data.
 */
function tangents(p: Point[]): number[] {
  const n = p.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = p[i]!;
    const p1 = p[i + 1]!;
    const dx = p1.x - p0.x;
    d.push(dx === 0 ? 0 : (p1.y - p0.y) / dx);
  }
  const m: number[] = new Array(n);
  const dd = (i: number) => d[i]!;
  const mm = (i: number) => m[i]!;
  m[0] = d[0] ?? 0;
  m[n - 1] = d[n - 2] ?? 0;
  for (let i = 1; i < n - 1; i++) m[i] = dd(i - 1) * dd(i) <= 0 ? 0 : (dd(i - 1) + dd(i)) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (dd(i) === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = mm(i) / dd(i);
    const b = mm(i + 1) / dd(i);
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * dd(i);
      m[i + 1] = t * b * dd(i);
    }
  }
  return m;
}

/** Bezier control points for each segment of a monotone curve. */
export function monotoneControls(p: Point[]): { c1: Point; c2: Point }[] {
  if (p.length < 2) return [];
  const m = tangents(p);
  return p.slice(0, -1).map((a, i) => {
    const b = p[i + 1]!;
    const h = b.x - a.x;
    return {
      c1: { x: a.x + h / 3, y: a.y + (m[i]! * h) / 3 },
      c2: { x: b.x - h / 3, y: b.y - (m[i + 1]! * h) / 3 },
    };
  });
}

/** Segment commands (everything after the initial move) for one run of points. */
function segments(p: Point[], curve: Curve): string {
  if (p.length < 2) return '';
  if (curve === 'linear') return p.slice(1).map((q) => `L${pt(q.x, q.y)}`).join('');
  if (curve === 'step') {
    let s = '';
    for (let i = 1; i < p.length; i++) {
      const cur = p[i]!;
      s += `L${pt(cur.x, p[i - 1]!.y)}L${pt(cur.x, cur.y)}`;
    }
    return s;
  }
  return monotoneControls(p)
    .map((c, i) => `C${pt(c.c1.x, c.c1.y)} ${pt(c.c2.x, c.c2.y)} ${pt(p[i + 1]!.x, p[i + 1]!.y)}`)
    .join('');
}

/** Split into runs of consecutive defined points (gaps = null). */
function runs(points: (Point | null)[]): Point[][] {
  const out: Point[][] = [];
  let cur: Point[] = [];
  for (const q of points) {
    if (q) cur.push(q);
    else if (cur.length) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

export function linePath(points: (Point | null)[], curve: Curve = 'monotone'): string {
  return runs(points)
    .map((run) => `M${pt(run[0]!.x, run[0]!.y)}${segments(run, curve)}`)
    .join('');
}

/**
 * Closed area between `top` and either a flat baseline (number) or a lower line
 * (stacked areas). The lower line is drawn backwards with the same curve.
 */
export function areaPath(top: Point[], bottom: number | Point[], curve: Curve = 'monotone'): string {
  if (top.length === 0) return '';
  const low = typeof bottom === 'number' ? top.map((q) => ({ x: q.x, y: bottom })) : bottom;
  const back = [...low].reverse();
  const first = top[0]!;
  const last = back[0] ?? first;
  const head = `M${pt(first.x, first.y)}${segments(top, curve)}`;
  return `${head}L${pt(last.x, last.y)}${segments(back, curve)}Z`;
}

export type BarEdge = 'top' | 'bottom' | 'left' | 'right' | 'none';

/** A bar with only the far end rounded (top for rising bars, bottom for negative ones...). */
export function barPath(x: number, y: number, w: number, h: number, radius: number, edge: BarEdge): string {
  const rad = Math.max(0, Math.min(radius, w / 2, h / 2));
  const x1 = x + w;
  const y1 = y + h;
  if (edge === 'none' || rad === 0) return `M${pt(x, y)}H${r(x1)}V${r(y1)}H${r(x)}Z`;
  const a = (dx: number, dy: number) => `A${r(rad)} ${r(rad)} 0 0 1 ${pt(dx, dy)}`;
  switch (edge) {
    case 'top':
      return `M${pt(x, y1)}V${r(y + rad)}${a(x + rad, y)}H${r(x1 - rad)}${a(x1, y + rad)}V${r(y1)}Z`;
    case 'bottom':
      return `M${pt(x, y)}H${r(x1)}V${r(y1 - rad)}${a(x1 - rad, y1)}H${r(x + rad)}${a(x, y1 - rad)}Z`;
    case 'right':
      return `M${pt(x, y)}H${r(x1 - rad)}${a(x1, y + rad)}V${r(y1 - rad)}${a(x1 - rad, y1)}H${r(x)}Z`;
    default:
      return `M${pt(x1, y)}H${r(x + rad)}${a(x, y + rad)}V${r(y1 - rad)}${a(x + rad, y1)}H${r(x1)}Z`;
  }
}

/** Polar to cartesian. Angles in radians, 0 at 12 o'clock, increasing clockwise. */
export function polar(cx: number, cy: number, radius: number, angle: number): Point {
  return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
}

export interface ArcOptions {
  cx: number;
  cy: number;
  inner: number;
  outer: number;
  start: number;
  end: number;
  /** Gap between neighbouring slices, in radians (split between both edges). */
  padAngle?: number;
  cornerRadius?: number;
}

/** Closed donut/pie slice with an angular gap and rounded corners. */
export function arcPath({ cx, cy, inner, outer, start, end, padAngle = 0, cornerRadius = 0 }: ArcOptions): string {
  const full = Math.PI * 2;
  if (end - start >= full - 1e-4) {
    const o = (a: number) => pt(cx + outer * Math.sin(a), cy - outer * Math.cos(a));
    const ring = `M${o(0)}A${r(outer)} ${r(outer)} 0 1 1 ${o(Math.PI)}A${r(outer)} ${r(outer)} 0 1 1 ${o(0)}Z`;
    if (inner <= 0.5) return ring;
    const i = (a: number) => pt(cx + inner * Math.sin(a), cy - inner * Math.cos(a));
    return `${ring}M${i(0)}A${r(inner)} ${r(inner)} 0 1 0 ${i(Math.PI)}A${r(inner)} ${r(inner)} 0 1 0 ${i(0)}Z`;
  }
  const pad = Math.min(padAngle / 2, (end - start) / 4);
  const a0 = start + pad;
  const a1 = end - pad;
  const span = a1 - a0;
  const pie = inner <= 0.5;
  // Shrink the corner until the fillets fit inside the slice
  let rc = Math.max(0, Math.min(cornerRadius, (outer - (pie ? 0 : inner)) / 2 - 0.01));
  for (let i = 0; i < 12 && rc > 0.2; i++) {
    const dOuter = Math.asin(Math.min(1, rc / (outer - rc)));
    const dInner = pie ? 0 : Math.asin(Math.min(1, rc / (inner + rc)));
    if (2 * dOuter <= span && 2 * dInner <= span) break;
    rc *= 0.8;
  }
  const P = (rad: number, a: number) => polar(cx, cy, rad, a);
  const s = (p: Point) => pt(p.x, p.y);
  const R = r(rc);

  if (rc < 0.2) {
    const large = span > Math.PI ? 1 : 0;
    const o0 = P(outer, a0);
    const o1 = P(outer, a1);
    if (pie) return `M${pt(cx, cy)}L${s(o0)}A${r(outer)} ${r(outer)} 0 ${large} 1 ${s(o1)}Z`;
    const i0 = P(inner, a0);
    const i1 = P(inner, a1);
    return `M${s(i0)}L${s(o0)}A${r(outer)} ${r(outer)} 0 ${large} 1 ${s(o1)}L${s(i1)}A${r(inner)} ${r(inner)} 0 ${large} 0 ${s(i0)}Z`;
  }

  // Fillet circles sit rc inside the outer circle and rc from each radial edge
  const dO = Math.asin(rc / (outer - rc));
  const lineO = Math.sqrt((outer - rc) ** 2 - rc ** 2);
  const o0Line = P(lineO, a0);
  const o0Arc = P(outer, a0 + dO);
  const o1Arc = P(outer, a1 - dO);
  const o1Line = P(lineO, a1);
  const outerLarge = span - 2 * dO > Math.PI ? 1 : 0;
  if (pie) {
    return `M${pt(cx, cy)}L${s(o0Line)}A${R} ${R} 0 0 1 ${s(o0Arc)}A${r(outer)} ${r(outer)} 0 ${outerLarge} 1 ${s(o1Arc)}A${R} ${R} 0 0 1 ${s(o1Line)}Z`;
  }
  const dI = Math.asin(rc / (inner + rc));
  const lineI = Math.sqrt((inner + rc) ** 2 - rc ** 2);
  const i0Line = P(lineI, a0);
  const i0Arc = P(inner, a0 + dI);
  const i1Arc = P(inner, a1 - dI);
  const i1Line = P(lineI, a1);
  const innerLarge = span - 2 * dI > Math.PI ? 1 : 0;
  return (
    `M${s(i0Line)}L${s(o0Line)}A${R} ${R} 0 0 1 ${s(o0Arc)}` +
    `A${r(outer)} ${r(outer)} 0 ${outerLarge} 1 ${s(o1Arc)}A${R} ${R} 0 0 1 ${s(o1Line)}` +
    `L${s(i1Line)}A${R} ${R} 0 0 1 ${s(i1Arc)}` +
    `A${r(inner)} ${r(inner)} 0 ${innerLarge} 0 ${s(i0Arc)}A${R} ${R} 0 0 1 ${s(i0Line)}Z`
  );
}

/** An open arc along one radius, for stroked rings and gauges. */
export function ringPath(cx: number, cy: number, radius: number, start: number, end: number): string {
  const sweep = Math.min(end - start, Math.PI * 2 - 1e-3);
  if (sweep <= 0) return '';
  const a = polar(cx, cy, radius, start);
  const b = polar(cx, cy, radius, start + sweep);
  return `M${pt(a.x, a.y)}A${r(radius)} ${r(radius)} 0 ${sweep > Math.PI ? 1 : 0} 1 ${pt(b.x, b.y)}`;
}
