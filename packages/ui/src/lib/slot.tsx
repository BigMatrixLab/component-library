import * as React from 'react';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from './cn';
import { composeRefs } from './compose-refs';

/**
 * Slot — renders its single child instead of its own element, merging props.
 * Powers `asChild`: <Button asChild><a href="/">Home</a></Button>.
 * Event handlers are chained (child first), className is joined, style merged.
 */
export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

type AnyProps = Record<string, unknown>;

const LAZY = Symbol.for('react.lazy');

/**
 * In React Server Components, children passed into a client component can arrive
 * as lazy references. Unwrap them with React.use (React 19) before cloning.
 */
function resolveLazy(node: ReactNode): ReactNode {
  const maybe = node as { $$typeof?: symbol; _payload?: unknown } | null;
  const use = (React as unknown as { use?: (p: unknown) => ReactNode }).use;
  if (maybe && typeof maybe === 'object' && maybe.$$typeof === LAZY && typeof use === 'function') {
    return use(maybe._payload);
  }
  return node;
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps, ...childProps };
  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof slotValue === 'function' && typeof childValue === 'function') {
      merged[key] = (...args: unknown[]) => {
        (childValue as (...a: unknown[]) => void)(...args);
        (slotValue as (...a: unknown[]) => void)(...args);
      };
    } else if (key === 'className') {
      merged[key] = cn(slotValue as string, childValue as string);
    } else if (key === 'style') {
      merged[key] = { ...(slotValue as object), ...(childValue as object) };
    }
  }
  return merged;
}

export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot({ children, ...props }, ref) {
  const child = resolveLazy(Children.only(resolveLazy(children) as ReactElement));
  if (!isValidElement(child)) return null;
  const element = child as ReactElement<AnyProps & { ref?: Ref<HTMLElement> }>;
  // React 19 exposes ref as a prop; React 18 keeps it on the element.
  const childRef = (element.props.ref ?? (element as unknown as { ref?: Ref<HTMLElement> }).ref) as Ref<HTMLElement> | undefined;
  return cloneElement(element, {
    ...mergeProps(props as AnyProps, element.props),
    ref: ref ? composeRefs(ref, childRef) : childRef,
  });
});
