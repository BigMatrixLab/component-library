import { areaPath, arcPath, barPath, linePath, monotoneControls, polar, ringPath } from './path';

const nums = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe('monotoneControls', () => {
  it('never overshoots the data between two points', () => {
    const pts = [0, 10, 11, 11, 40, 41, 5, 5, 5, 60].map((y, i) => ({ x: i * 20, y }));
    monotoneControls(pts).forEach((c, i) => {
      const lo = Math.min(pts[i].y, pts[i + 1].y);
      const hi = Math.max(pts[i].y, pts[i + 1].y);
      expect(c.c1.y).toBeGreaterThanOrEqual(lo - 1e-9);
      expect(c.c1.y).toBeLessThanOrEqual(hi + 1e-9);
      expect(c.c2.y).toBeGreaterThanOrEqual(lo - 1e-9);
      expect(c.c2.y).toBeLessThanOrEqual(hi + 1e-9);
    });
  });
  it('keeps flat runs flat and turns at extremes', () => {
    const pts = [5, 5, 20, 5].map((y, i) => ({ x: i * 10, y }));
    const c = monotoneControls(pts);
    expect(c[0].c1.y).toBe(5);
    expect(c[0].c2.y).toBe(5);
    expect(c[1].c2.y).toBe(20);
  });
});

describe('linePath', () => {
  const pts = [{ x: 0, y: 10 }, { x: 10, y: 20 }, { x: 20, y: 5 }];
  it('draws linear, step and monotone', () => {
    expect(linePath(pts, 'linear')).toBe('M0 10L10 20L20 5');
    expect(linePath(pts, 'step')).toBe('M0 10L10 10L10 20L20 20L20 5');
    expect(linePath(pts, 'monotone')).toMatch(/^M0 10C.*C/);
  });
  it('breaks the line at gaps', () => {
    expect(linePath([pts[0], pts[1], null, pts[2], { x: 30, y: 1 }], 'linear')).toBe('M0 10L10 20M20 5L30 1');
  });
});

describe('areaPath', () => {
  it('closes down to the baseline', () => {
    expect(areaPath([{ x: 0, y: 10 }, { x: 10, y: 5 }], 50, 'linear')).toBe('M0 10L10 5L10 50L0 50Z');
  });
  it('follows a lower line for stacked areas', () => {
    const d = areaPath([{ x: 0, y: 10 }, { x: 10, y: 5 }], [{ x: 0, y: 30 }, { x: 10, y: 40 }], 'linear');
    expect(d).toBe('M0 10L10 5L10 40L0 30Z');
  });
});

describe('barPath', () => {
  it('rounds only the requested edge', () => {
    expect(barPath(0, 0, 10, 20, 0, 'top')).toBe('M0 0H10V20H0Z');
    const top = barPath(0, 0, 10, 20, 4, 'top');
    expect(top).toContain('A4 4');
    expect((top.match(/A/g) ?? []).length).toBe(2);
    expect(barPath(0, 0, 10, 20, 4, 'none')).toBe('M0 0H10V20H0Z');
  });
  it('caps the radius at half the bar', () => {
    expect(barPath(0, 0, 6, 100, 10, 'top')).toContain('A3 3');
  });
});

describe('arcPath', () => {
  const dist = (x: number, y: number) => Math.hypot(x - 100, y - 100);
  it('stays inside the outer radius and outside the inner one', () => {
    const d = arcPath({ cx: 100, cy: 100, inner: 50, outer: 80, start: 0.3, end: 2.1, padAngle: 0.05, cornerRadius: 6 });
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    const n = nums(d);
    expect(n.every(Number.isFinite)).toBe(true);
    const ends = [...d.matchAll(/([MLA])([^MLAZ]*)/g)].map((m) => nums(m[2]).slice(-2));
    expect(ends.length).toBeGreaterThan(8);
    for (const [x, y] of ends) {
      const r = dist(x, y);
      expect(r).toBeLessThan(80.5);
      expect(r).toBeGreaterThan(49.5);
    }
  });
  it('draws pies from the centre, and a full ring when one slice fills the circle', () => {
    expect(arcPath({ cx: 100, cy: 100, inner: 0, outer: 80, start: 0, end: 1, cornerRadius: 0 }).startsWith('M100 100')).toBe(true);
    const ring = arcPath({ cx: 100, cy: 100, inner: 50, outer: 80, start: 0, end: Math.PI * 2 });
    expect((ring.match(/Z/g) ?? []).length).toBe(2);
  });
  it('shrinks corners that cannot fit in a thin slice', () => {
    const d = arcPath({ cx: 100, cy: 100, inner: 60, outer: 80, start: 0, end: 0.08, padAngle: 0.02, cornerRadius: 10 });
    expect(nums(d).every(Number.isFinite)).toBe(true);
  });
});

describe('polar / ringPath', () => {
  it('puts angle 0 at 12 o\'clock and goes clockwise', () => {
    expect(polar(0, 0, 10, 0)).toEqual({ x: 0, y: -10 });
    const q = polar(0, 0, 10, Math.PI / 2);
    expect(q.x).toBeCloseTo(10);
    expect(q.y).toBeCloseTo(0);
  });
  it('is empty for a zero sweep and flags large arcs', () => {
    expect(ringPath(0, 0, 10, 0, 0)).toBe('');
    expect(ringPath(0, 0, 10, 0, Math.PI * 1.5)).toContain(' 1 1 ');
  });
});
