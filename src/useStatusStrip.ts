import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useScreenLayout from './useScreenLayout';
import type { StatusStrip } from './types';

// Where is the iPhone Duo's status bar strip (time, wifi)?
// It moves with how the phone is held, and the safe-area insets tell us:
//   'right' → strip down the right edge (folded, or unfolded landscape).
//             Only the right side is inset; a normal iPhone in landscape
//             is inset on both sides.
//   'top'   → strip across the top (unfolded portrait). A normal iPhone in
//             portrait also has a top inset, but its screen is too narrow
//             to count as expanded. iPads are left out: their clock sits
//             on the top left, where strip content would go.
//   null    → no strip we can use (e.g. a normal phone).
// Like useWindowDimensions, the insets update when the device folds or
// rotates, so every component using this hook re-renders with the new answer.
export default function useStatusStrip(): StatusStrip {
  const insets = useSafeAreaInsets();
  const { isExpanded } = useScreenLayout();

  if (insets.right > 0 && insets.left === 0) {
    return 'right';
  }
  const isPad = Platform.OS === 'ios' && Platform.isPad;
  if (insets.top > 0 && isExpanded && !isPad) {
    return 'top';
  }
  return null;
}
