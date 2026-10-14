import { useContext, useId, useLayoutEffect, type ReactNode } from 'react';
import { StatusStripRegistryContext } from './StatusStripContext';

export type StatusStripPortalProps = {
  /**
   * When false the content is withdrawn from the strip. With react-navigation,
   * pass `useIsFocused()` so only the focused screen fills the strip.
   * Default true.
   */
  enabled?: boolean;
  children: ReactNode;
};

// Declares what goes in the status strip, from anywhere under a
// StatusStripProvider. Renders nothing in place: the content is shown by the
// StatusStripSafeAreaView. A screen inside the safe area can't draw into the
// strip itself, because a touch only reaches a view that lies inside all of
// its parents, and the screen's bounds stop short of the strip.
//
// The content is rendered at the provider, so it sees the provider's React
// context, not this component's. The most recently enabled portal wins.
export default function StatusStripPortal({
  enabled = true,
  children,
}: StatusStripPortalProps) {
  const registry = useContext(StatusStripRegistryContext);
  const id = useId();

  if (__DEV__ && !registry) {
    console.warn(
      'StatusStripPortal must be rendered inside a StatusStripProvider.',
    );
  }

  useLayoutEffect(() => {
    if (!registry || !enabled) {
      return;
    }
    registry.set(id, children);
  }, [registry, enabled, id, children]);

  // Withdraw only when disabled or unmounted, not on every content update,
  // so updating a portal doesn't move it to the top.
  useLayoutEffect(() => {
    if (!registry || !enabled) {
      return;
    }
    return () => registry.remove(id);
  }, [registry, enabled, id]);

  return null;
}
