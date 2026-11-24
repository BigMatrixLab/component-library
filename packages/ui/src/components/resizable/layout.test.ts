import { constrainSize, isValidLayout, normalizeLayout, resizePair, type PanelConstraints } from './layout';

const open: PanelConstraints = { min: 10, max: 80, collapsible: false, collapsedSize: 0 };
const collapsible: PanelConstraints = { min: 20, max: 60, collapsible: true, collapsedSize: 0 };
const wide: PanelConstraints = { min: 0, max: 100, collapsible: false, collapsedSize: 0 };

describe('resizable layout', () => {
  it('moves a divider and keeps the pair total', () => {
    const next = resizePair([40, 60], [open, open], 0, 10);
    expect(next).toEqual([50, 50]);
  });

  it('clamps at the neighbour limits', () => {
    expect(resizePair([40, 60], [open, open], 0, 100)).toEqual([80, 20]);
    expect(resizePair([40, 60], [open, open], 0, -100)).toEqual([20, 80]);
  });

  it('only changes the two panels beside the divider', () => {
    expect(resizePair([20, 30, 50], [open, open, open], 1, 10)).toEqual([20, 40, 40]);
  });

  it('collapses a collapsible panel below half its minimum', () => {
    expect(constrainSize(collapsible, 8)).toBe(0);
    expect(constrainSize(collapsible, 12)).toBe(20);
    expect(resizePair([30, 70], [collapsible, wide], 0, -25)).toEqual([0, 100]);
  });

  it('fills missing default sizes and scales to 100', () => {
    expect(normalizeLayout([20, undefined, undefined]).map(Math.round)).toEqual([20, 40, 40]);
    expect(normalizeLayout([1, 1]).map(Math.round)).toEqual([50, 50]);
    expect(normalizeLayout([])).toEqual([]);
  });

  it('accepts only complete stored layouts', () => {
    expect(isValidLayout([25, 75], 2)).toBe(true);
    expect(isValidLayout([25, 70], 2)).toBe(false);
    expect(isValidLayout([25, 75], 3)).toBe(false);
    expect(isValidLayout('nope', 2)).toBe(false);
  });
});
