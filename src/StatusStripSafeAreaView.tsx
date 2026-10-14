import { useContext } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StatusStripConfigContext,
  StatusStripContentContext,
} from './StatusStripContext';
import useStatusStrip from './useStatusStrip';

// Use as the root of a screen instead of a SafeAreaView. It fills the whole
// window and pads itself away from the system areas, so its children stay in
// the safe area while the status strip content (from StatusStripPortal) can
// sit inside that padding and still be tappable:
//   'right' → a column just below the wifi icon.
//   'top'   → a row on the left, beside the time and wifi icon.
//   null    → nothing is shown; render the content elsewhere (e.g. a bottom
//             tab bar) when useStatusStrip() returns null.
export default function StatusStripSafeAreaView({
  style,
  children,
  ...rest
}: ViewProps) {
  const insets = useSafeAreaInsets();
  const strip = useStatusStrip();
  const { iconsOffset, topStripLeftGap } = useContext(StatusStripConfigContext);
  const content = useContext(StatusStripContentContext);

  const hostStyle =
    strip === 'right'
      ? [styles.column, { top: iconsOffset, width: insets.right }]
      : [
          styles.row,
          { left: insets.left + topStripLeftGap, height: insets.top },
        ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      {...rest}
    >
      {children}
      {strip && content != null && (
        <View style={hostStyle} testID="status-strip-host">
          {content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  column: {
    position: 'absolute',
    right: 5,
    alignItems: 'center',
  },
  row: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
