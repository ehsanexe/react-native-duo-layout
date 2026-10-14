import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_EXPANDED_MIN_WIDTH,
  DEFAULT_STATUS_ICONS_OFFSET,
} from './constants';
import {
  StatusStripConfigContext,
  StatusStripContentContext,
  StatusStripRegistryContext,
} from './StatusStripContext';

export type StatusStripProviderProps = {
  /** Minimum window width (points) for the expanded layout. Default 600. */
  expandedMinWidth?: number;
  /**
   * How far down the right strip its content starts, leaving room for the
   * camera, time and wifi icon. Default 160.
   */
  iconsOffset?: number;
  children: ReactNode;
};

type Entry = { id: string; content: ReactNode };

// Collects what StatusStripPortals want to show in the strip, so a
// StatusStripSafeAreaView at the root can render it where it is tappable.
// The most recently registered portal wins.
export default function StatusStripProvider({
  expandedMinWidth = DEFAULT_EXPANDED_MIN_WIDTH,
  iconsOffset = DEFAULT_STATUS_ICONS_OFFSET,
  children,
}: StatusStripProviderProps) {
  const [entries, setEntries] = useState<Entry[]>([]);

  // Updating a portal keeps its place; a new portal goes on top.
  const set = useCallback((id: string, content: ReactNode) => {
    setEntries(prev => {
      const index = prev.findIndex(entry => entry.id === id);
      if (index === -1) {
        return [...prev, { id, content }];
      }
      const next = prev.slice();
      next[index] = { id, content };
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const config = useMemo(
    () => ({ expandedMinWidth, iconsOffset }),
    [expandedMinWidth, iconsOffset],
  );
  const registry = useMemo(() => ({ set, remove }), [set, remove]);
  const content = entries.length ? entries[entries.length - 1].content : null;

  return (
    <StatusStripConfigContext.Provider value={config}>
      <StatusStripRegistryContext.Provider value={registry}>
        <StatusStripContentContext.Provider value={content}>
          {children}
        </StatusStripContentContext.Provider>
      </StatusStripRegistryContext.Provider>
    </StatusStripConfigContext.Provider>
  );
}
