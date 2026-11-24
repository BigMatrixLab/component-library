/* Pure positioning maths for floating panels (no DOM writes). */

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';
export type Placement = Side | `${Side}-${Exclude<Align, 'center'>}`;

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PositionOptions {
  placement?: Placement;
  /** Gap between anchor and panel, px. */
  offset?: number;
  /** Minimum distance from the viewport edge, px. */
  padding?: number;
  /** Flip to the opposite side when there is not enough room. */
  flip?: boolean;
}

export interface PositionResult {
  x: number;
  y: number;
  side: Side;
  align: Align;
  /** transform-origin pointing back at the anchor, e.g. "24px top". */
  origin: string;
}

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export function computePosition(
  anchor: Rect,
  panel: { width: number; height: number },
  viewport: { width: number; height: number },
  { placement = 'bottom-start', offset = 6, padding = 8, flip = true }: PositionOptions = {},
): PositionResult {
  const [rawSide, rawAlign] = placement.split('-') as [Side, Align | undefined];
  let side = rawSide;
  const align: Align = rawAlign ?? 'center';
  const a = { ...anchor, right: anchor.left + anchor.width, bottom: anchor.top + anchor.height };

  const space: Record<Side, number> = {
    top: a.top,
    bottom: viewport.height - a.bottom,
    left: a.left,
    right: viewport.width - a.right,
  };
  const vertical = side === 'top' || side === 'bottom';
  const need = (vertical ? panel.height : panel.width) + offset;
  if (flip && space[side] < need && space[opposite[side]] > space[side]) side = opposite[side];

  let x: number;
  let y: number;
  if (side === 'top' || side === 'bottom') {
    y = side === 'bottom' ? a.bottom + offset : a.top - panel.height - offset;
    x = align === 'start' ? a.left : align === 'end' ? a.right - panel.width : a.left + a.width / 2 - panel.width / 2;
  } else {
    x = side === 'right' ? a.right + offset : a.left - panel.width - offset;
    y = align === 'start' ? a.top : align === 'end' ? a.bottom - panel.height : a.top + a.height / 2 - panel.height / 2;
  }

  // Shift into the viewport
  x = Math.max(padding, Math.min(x, viewport.width - panel.width - padding));
  y = Math.max(padding, Math.min(y, viewport.height - panel.height - padding));

  const clamp = (v: number, max: number) => Math.round(Math.min(Math.max(v, 0), max));
  const ox = side === 'left' ? 'right' : side === 'right' ? 'left' : `${clamp(a.left + a.width / 2 - x, panel.width)}px`;
  const oy = side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : `${clamp(a.top + a.height / 2 - y, panel.height)}px`;

  return { x: Math.round(x), y: Math.round(y), side, align, origin: `${ox} ${oy}` };
}
