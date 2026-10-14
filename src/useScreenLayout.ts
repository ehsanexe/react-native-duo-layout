import { useContext } from 'react';
import { useWindowDimensions } from 'react-native';
import { StatusStripConfigContext } from './StatusStripContext';
import type { ScreenLayout } from './types';

export type UseScreenLayoutOptions = {
  /**
   * Minimum window width (points) for the expanded layout. Defaults to the
   * StatusStripProvider's `expandedMinWidth`, or 600 without a provider.
   */
  expandedMinWidth?: number;
};

// Decides the layout from the window size alone (see ScreenLayout).
// When the device folds, unfolds or rotates, iOS resizes the app window and
// useWindowDimensions() re-renders every component that uses this hook.
export default function useScreenLayout(
  options: UseScreenLayoutOptions = {},
): ScreenLayout {
  const { width, height } = useWindowDimensions();
  const config = useContext(StatusStripConfigContext);
  const expandedMinWidth = options.expandedMinWidth ?? config.expandedMinWidth;

  return {
    width: Math.round(width),
    height: Math.round(height),
    isExpanded: width >= expandedMinWidth,
    orientation: width > height ? 'landscape' : 'portrait',
  };
}
