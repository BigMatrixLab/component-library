import type { SVGProps } from 'react';

type GlyphProps = Omit<SVGProps<SVGSVGElement>, 'ref'>;

/**
 * Small motion glyphs shared by the morphing buttons. Styles live in
 * styles/components/action-button.css (`ui-glyph-*`).
 */

/** A 14px ring spinner. Inherits currentColor. */
export function SpinnerGlyph({ className }: { className?: string }) {
  return <span aria-hidden="true" className={className ? `ui-glyph-spinner ${className}` : 'ui-glyph-spinner'} />;
}

/** A check that draws itself (stroke-dashoffset). */
export function CheckGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      className={props.className ? `ui-glyph-check ${props.className}` : 'ui-glyph-check'}
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
    </svg>
  );
}

/** A cross that pops in. */
export function CrossGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      className={props.className ? `ui-glyph-cross ${props.className}` : 'ui-glyph-cross'}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
