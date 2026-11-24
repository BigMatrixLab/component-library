import { Children, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'rounded';
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

const STATUS_LABEL: Record<AvatarStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** 24 / 32 / 40 / 48 / 64px. Without it the size is inherited from an AvatarGroup, else 40px. */
  size?: AvatarSize;
  /** `circle` (default) or `rounded` (a rounded square, for organisations and products). */
  shape?: AvatarShape;
  /** A presence dot on the bottom-right corner, with a ring in the surface colour. */
  status?: AvatarStatus;
  /** Accessible name for the status dot. Defaults to "Online", "Away"… */
  statusLabel?: string;
}

/** Up to two initials from a name: "Amina Rahman" gives "AR". */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0]![0]!;
  const last = parts.length > 1 ? parts[parts.length - 1]![0]! : '';
  return (first + last).toUpperCase();
}

/**
 * Avatar — a person or account. Compose with `AvatarImage` (hides itself if
 * the image fails) and `AvatarFallback` (initials or an icon, always rendered
 * underneath). Server Component–safe; only AvatarImage is a client component.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size, shape = 'circle', status, statusLabel, className, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn('ui-avatar', size && `ui-avatar-${size}`, shape === 'rounded' && 'ui-avatar-rounded', className)}
      {...props}
    >
      {children}
      {status && <span className="ui-avatar-status" data-status={status} role="img" aria-label={statusLabel ?? STATUS_LABEL[status]} />}
    </span>
  );
});

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {}

/** Initials (or an icon) shown until the image loads, or when there is none. */
export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(function AvatarFallback(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn('ui-avatar-fallback', className)} {...props} />;
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Size for every avatar in the group. */
  size?: AvatarSize;
  /** Show at most this many avatars, then a "+N" avatar for the rest. */
  max?: number;
}

/**
 * Overlapping avatars with a ring in the background colour (set
 * `--ui-avatar-ring` on the group when it sits on a card or other surface).
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { size, max, className, children, role = 'group', ...props },
  ref,
) {
  const items = Children.toArray(children);
  const visible: ReactNode[] = max !== undefined && items.length > max ? items.slice(0, max) : items;
  const extra = items.length - visible.length;
  return (
    <div ref={ref} role={role} className={cn('ui-avatar-group', size && `ui-avatar-group-${size}`, className)} {...props}>
      {visible}
      {extra > 0 && (
        <Avatar>
          <AvatarFallback title={`${extra} more`}>+{extra}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});
