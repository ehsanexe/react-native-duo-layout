import { createContext, type ReactNode } from 'react';
import {
  DEFAULT_EXPANDED_MIN_WIDTH,
  DEFAULT_STATUS_ICONS_OFFSET,
  DEFAULT_TOP_STRIP_LEFT_GAP,
} from './constants';

export type StatusStripConfig = {
  expandedMinWidth: number;
  iconsOffset: number;
  topStripLeftGap: number;
};

export type StatusStripRegistry = {
  /** Adds or updates the content for a portal id. */
  set: (id: string, content: ReactNode) => void;
  /** Removes a portal's content. */
  remove: (id: string) => void;
};

// Split in three so each consumer only re-renders for what it reads:
// hooks read the config, portals the (stable) registry, the host the content.
export const StatusStripConfigContext = createContext<StatusStripConfig>({
  expandedMinWidth: DEFAULT_EXPANDED_MIN_WIDTH,
  iconsOffset: DEFAULT_STATUS_ICONS_OFFSET,
  topStripLeftGap: DEFAULT_TOP_STRIP_LEFT_GAP,
});

export const StatusStripRegistryContext =
  createContext<StatusStripRegistry | null>(null);

export const StatusStripContentContext = createContext<ReactNode>(null);
