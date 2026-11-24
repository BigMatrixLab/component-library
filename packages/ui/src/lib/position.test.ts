import { computePosition } from './position';

const vp = { width: 1000, height: 800 };
const panel = { width: 200, height: 100 };

describe('computePosition', () => {
  it('places below, aligned to the start, with the offset', () => {
    const r = computePosition({ left: 100, top: 100, width: 80, height: 32 }, panel, vp, { placement: 'bottom-start', offset: 6 });
    expect(r).toMatchObject({ x: 100, y: 138, side: 'bottom', align: 'start' });
  });

  it('flips to the top when there is no room below', () => {
    const r = computePosition({ left: 100, top: 740, width: 80, height: 32 }, panel, vp, { placement: 'bottom-start', offset: 6 });
    expect(r.side).toBe('top');
    expect(r.y).toBe(740 - 100 - 6);
  });

  it('shifts back inside the viewport padding', () => {
    const r = computePosition({ left: 950, top: 100, width: 40, height: 32 }, panel, vp, { placement: 'bottom-start', padding: 8 });
    expect(r.x).toBe(1000 - 200 - 8);
  });

  it('centres when no alignment is given', () => {
    const r = computePosition({ left: 400, top: 100, width: 100, height: 32 }, panel, vp, { placement: 'bottom' });
    expect(r.x).toBe(350);
  });

  it('points the transform origin back at the anchor', () => {
    const r = computePosition({ left: 100, top: 100, width: 80, height: 32 }, panel, vp, { placement: 'bottom-start' });
    expect(r.origin).toBe('40px top');
  });
});
