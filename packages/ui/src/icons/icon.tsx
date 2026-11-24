import { forwardRef, type SVGProps } from 'react';
import { cn } from '../lib/cn';
import { iconPaths, type IconName } from './paths';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Icon shape. */
  name: IconName;
  /** Pixel size (width and height). Default 16. */
  size?: number | string;
  /** Stroke width. Default 1.75. */
  strokeWidth?: number;
  /** Accessible label. Without it the icon is decorative (aria-hidden). */
  label?: string;
}

/**
 * Built-in stroke icon. Inherits `currentColor`.
 *   <Icon name="check" />   <Icon name="search" size={20} label="Search" />
 * Server Component–safe.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 16, strokeWidth = 1.75, label, className, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      className={cn('ui-icon', className)}
      // Static, library-owned SVG markup — never user input.
      dangerouslySetInnerHTML={{ __html: iconPaths[name] }}
      {...props}
    />
  );
});

export { iconPaths, type IconName };
