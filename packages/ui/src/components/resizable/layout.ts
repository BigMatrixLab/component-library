/** Pure layout math for resizable panels. Sizes are percentages that add up to 100. */

export interface PanelConstraints {
  /** Smallest size when open, in %. */
  min: number;
  /** Largest size, in %. */
  max: number;
  /** May be dragged past half its minimum to snap shut at `collapsedSize`. */
  collapsible: boolean;
  /** Size when collapsed, in %. */
  collapsedSize: number;
}

const EPSILON = 0.05;

export const round = (n: number) => Math.round(n * 100) / 100;

export function isCollapsed(c: PanelConstraints, size: number): boolean {
  return c.collapsible && size <= c.collapsedSize + EPSILON;
}

/** Clamp a wanted size into the panel's range; a collapsible panel snaps shut below half-way to its minimum. */
export function constrainSize(c: PanelConstraints, size: number): number {
  if (c.collapsible && size < c.collapsedSize + (c.min - c.collapsedSize) / 2) return c.collapsedSize;
  return Math.min(c.max, Math.max(c.min, size));
}

/**
 * Move the divider between panel `i` and `i + 1` by `delta` percentage points. Only those two panels
 * change; the result still sums to the same total. If neither panel can absorb the move, the layout is
 * returned unchanged.
 */
export function resizePair(layout: number[], constraints: PanelConstraints[], i: number, delta: number): number[] {
  const pa = constraints[i];
  const pb = constraints[i + 1];
  if (!pa || !pb) return layout;
  const total = layout[i]! + layout[i + 1]!;
  let a = constrainSize(pa, layout[i]! + delta);
  let b = total - a;
  const b2 = constrainSize(pb, b);
  if (Math.abs(b2 - b) > 1e-9) {
    b = b2;
    a = total - b;
    if (Math.abs(constrainSize(pa, a) - a) > 1e-9) return layout;
  }
  const next = layout.slice();
  next[i] = a;
  next[i + 1] = b;
  return next;
}

/** Fill in missing default sizes (they share what is left) and scale everything to total 100. */
export function normalizeLayout(defaults: (number | undefined)[]): number[] {
  const n = defaults.length;
  if (!n) return [];
  const known = defaults.reduce<number>((sum, d) => sum + (d ?? 0), 0);
  const unknown = defaults.filter((d) => d === undefined).length;
  const filled = defaults.map((d) => d ?? Math.max(0, 100 - known) / Math.max(1, unknown));
  const sum = filled.reduce((a, b) => a + b, 0);
  if (sum <= 0) return filled.map(() => 100 / n);
  return filled.map((v) => (v / sum) * 100);
}

/** A stored layout is only reused if it has the right length, finite numbers and totals ~100. */
export function isValidLayout(value: unknown, count: number): value is number[] {
  if (!Array.isArray(value) || value.length !== count) return false;
  if (!value.every((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0)) return false;
  const sum = (value as number[]).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100) < 1;
}
