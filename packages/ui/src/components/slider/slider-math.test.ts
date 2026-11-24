import { keyToValue, nearestThumb, pointerToRatio, sameValues, setThumbValue, snapToStep, valueToRatio } from './slider-math';

describe('snapToStep', () => {
  it('snaps to the step grid and clamps', () => {
    expect(snapToStep(43, 0, 100, 10)).toBe(40);
    expect(snapToStep(46, 0, 100, 10)).toBe(50);
    expect(snapToStep(-5, 0, 100, 10)).toBe(0);
    expect(snapToStep(130, 0, 100, 10)).toBe(100);
  });
  it('counts steps from min, not from zero', () => {
    expect(snapToStep(12, 5, 100, 10)).toBe(15);
  });
  it('avoids float noise', () => {
    expect(snapToStep(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
    expect(snapToStep(0.123, 0, 1, 0.01)).toBe(0.12);
  });
});

describe('pointerToRatio', () => {
  const base = { trackStart: 100, trackLength: 220, thumbSize: 20 };
  it('measures against the span the thumb centre travels', () => {
    expect(pointerToRatio({ ...base, pointer: 110 })).toBe(0);
    expect(pointerToRatio({ ...base, pointer: 210 })).toBe(0.5);
    expect(pointerToRatio({ ...base, pointer: 310 })).toBe(1);
  });
  it('clamps outside the track', () => {
    expect(pointerToRatio({ ...base, pointer: 0 })).toBe(0);
    expect(pointerToRatio({ ...base, pointer: 999 })).toBe(1);
  });
  it('flips for vertical (0 at the bottom)', () => {
    expect(pointerToRatio({ ...base, pointer: 110, vertical: true })).toBe(1);
    expect(pointerToRatio({ ...base, pointer: 310, vertical: true })).toBe(0);
  });
  it('keeps the grab offset so a thumb does not jump under the pointer', () => {
    expect(pointerToRatio({ ...base, pointer: 220, grabOffset: 10 })).toBe(0.5);
  });
});

describe('valueToRatio', () => {
  it('maps and clamps', () => {
    expect(valueToRatio(50, 0, 200)).toBe(0.25);
    expect(valueToRatio(500, 0, 200)).toBe(1);
    expect(valueToRatio(1, 1, 1)).toBe(0);
  });
});

describe('nearestThumb', () => {
  it('picks the closest thumb', () => {
    expect(nearestThumb([20, 80], 30)).toBe(0);
    expect(nearestThumb([20, 80], 70)).toBe(1);
  });
  it('on a tie at the same spot, picks the thumb that can move toward the value', () => {
    expect(nearestThumb([50, 50], 70)).toBe(1);
    expect(nearestThumb([50, 50], 30)).toBe(0);
  });
});

describe('setThumbValue', () => {
  const opts = { min: 0, max: 100, step: 5 };
  it('moves one thumb and snaps', () => {
    expect(setThumbValue([20, 80], 0, 33, opts)).toEqual([35, 80]);
  });
  it('never crosses a neighbour', () => {
    expect(setThumbValue([20, 80], 0, 95, opts)).toEqual([80, 80]);
    expect(setThumbValue([20, 80], 1, 5, opts)).toEqual([20, 20]);
  });
  it('keeps a minimum gap between thumbs', () => {
    expect(setThumbValue([20, 80], 0, 95, { ...opts, minStepsBetweenThumbs: 2 })).toEqual([70, 80]);
  });
  it('returns the same array when nothing changes', () => {
    const values = [20, 80];
    expect(setThumbValue(values, 0, 21, opts)).toBe(values);
  });
});

describe('keyToValue', () => {
  const o = { min: 0, max: 100, step: 5 };
  it('arrows move by one step, in both axes', () => {
    expect(keyToValue('ArrowRight', 50, o)).toBe(55);
    expect(keyToValue('ArrowUp', 50, o)).toBe(55);
    expect(keyToValue('ArrowLeft', 50, o)).toBe(45);
    expect(keyToValue('ArrowDown', 50, o)).toBe(45);
  });
  it('page keys move by about a tenth of the range', () => {
    expect(keyToValue('PageUp', 50, o)).toBe(60);
    expect(keyToValue('PageDown', 50, o)).toBe(40);
  });
  it('Home and End go to the bounds (a neighbour limit when given)', () => {
    expect(keyToValue('Home', 50, o)).toBe(0);
    expect(keyToValue('End', 50, { ...o, upperBound: 70 })).toBe(70);
  });
  it('ignores other keys', () => {
    expect(keyToValue('a', 50, o)).toBeUndefined();
  });
});

describe('sameValues', () => {
  it('compares by element', () => {
    expect(sameValues([1, 2], [1, 2])).toBe(true);
    expect(sameValues([1, 2], [1, 3])).toBe(false);
    expect(sameValues([1], [1, 2])).toBe(false);
  });
});
