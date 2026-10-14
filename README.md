# react-native-duo-layout

Fold-aware layout hooks and a **tappable** status-strip toolbar for the iPhone Duo (and other foldables) in React Native. Written in TypeScript; no native code.

- `useScreenLayout()`: compact vs expanded layout from the window size (re-renders on fold/unfold/rotate).
- `useStatusStrip()`: where the Duo's status bar strip is: `'right'`, `'top'` or `null`.
- `StatusStripProvider` + `StatusStripSafeAreaView` + `StatusStripPortal`: put Back buttons and tabs *inside* the strip from any screen and have them receive taps.

## Install

```sh
npm install react-native-duo-layout react-native-safe-area-context
```

Peer dependencies: `react`, `react-native`, `react-native-safe-area-context >= 4`.

## Usage

```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  StatusStripProvider,
  StatusStripSafeAreaView,
  StatusStripPortal,
  useScreenLayout,
  useStatusStrip,
} from 'react-native-duo-layout';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusStripProvider>
        {/* Replaces SafeAreaView at the root */}
        <StatusStripSafeAreaView style={{ backgroundColor: 'white' }}>
          <Home />
        </StatusStripSafeAreaView>
      </StatusStripProvider>
    </SafeAreaProvider>
  );
}

function Home() {
  const { isExpanded } = useScreenLayout();
  const strip = useStatusStrip(); // 'right' | 'top' | null

  return (
    <>
      {isExpanded ? <TwoPanes /> : <OnePane />}

      {/* Shown in the strip when there is one... */}
      <StatusStripPortal>
        <MyTabs direction={strip === 'right' ? 'column' : 'row'} />
      </StatusStripPortal>

      {/* ...and somewhere else when there isn't. */}
      {!strip && <BottomTabBar />}
    </>
  );
}
```

## API

### `useScreenLayout(options?)`

Returns `{ width, height, isExpanded, orientation }`. `isExpanded` is true when the window is at least `expandedMinWidth` wide (default **600pt**):

| Device | Size (pt) | isExpanded |
|---|---|---|
| iPhone Duo cover screen (folded) | 466 × 678 | false |
| iPhone Duo inner screen (unfolded) | 669 × 951 | true |
| iPhone 17 portrait / landscape | 402 × 874 / 874 × 402 | false / true |

`options.expandedMinWidth` overrides the provider's value for one call.

### `useStatusStrip()`

Reads the safe-area insets:

- `'right'`: only the right edge is inset (Duo folded, or unfolded landscape).
- `'top'`: top inset on an expanded, non-iPad screen (Duo unfolded portrait).
- `null`: no usable strip (normal phones, iPads).

### `<StatusStripProvider expandedMinWidth? iconsOffset?>`

Wrap the app once, inside `SafeAreaProvider`. `iconsOffset` (default **160**) is how far down the right strip its content starts, below the camera, time and wifi.

### `<StatusStripSafeAreaView {...ViewProps}>`

Use it as the root view. It fills the window, pads its children into the safe area, and renders the current strip content in the padding: as a column under the wifi icon (`'right'`), or as a row beside the clock (`'top'`). With no strip it renders nothing extra.

### `<StatusStripPortal enabled?>`

Declares the strip content from any depth. It renders nothing in place. The most recently enabled portal wins, and when it unmounts or is disabled the previous one comes back. With react-navigation, pass `enabled={useIsFocused()}`.

The content is rendered at the provider, so it sees the provider's React context, not the portal's (same as other portal libraries). Pass callbacks and values in as props or closures.

## Why a provider? (tappability)

On iOS and Android a touch only reaches a view if it is inside **every ancestor's bounds**. Screen content normally lives inside the safe-area padding, so a button pushed into the strip from there (with negative margins or `overflow: visible`) is drawn but never gets taps.

The strip content therefore has to be rendered by a view that covers the whole window: `StatusStripSafeAreaView`. If one root component owned all the state you wouldn't need a provider. You could render the toolbar as that root's direct child. But nested screens (a chat screen, a navigation stack screen) can't reach the root. `StatusStripPortal` lets them declare the content, and the provider carries it up to the root.

## License

MIT
