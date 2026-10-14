# react-native-duo-layout

Fold-aware layout hooks and a **tappable** status-strip toolbar for the iPhone Duo (and other foldables) in React Native. Written in TypeScript; no native code.

- `useScreenLayout()`: compact vs expanded layout from the window size (re-renders on fold/unfold/rotate).
- `useStatusStrip()`: where the Duo's status bar strip is: `'right'`, `'top'` or `null`.
- `StatusStripProvider` + `StatusStripSafeAreaView` + `StatusStripPortal`: put Back buttons and tabs *inside* the strip from any screen and have them receive taps.
- Every layout value (expanded width, strip offsets) has a sensible default you can change.

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

### With react-navigation

Screens in a stack stay mounted when another screen is pushed on top. Pass the focus state so only the visible screen fills the strip:

```tsx
import { useIsFocused } from '@react-navigation/native';

function ChatScreen({ navigation }) {
  const isFocused = useIsFocused();

  return (
    <>
      <StatusStripPortal enabled={isFocused}>
        <BackButton onPress={navigation.goBack} />
      </StatusStripPortal>
      <Messages />
    </>
  );
}
```

Put `StatusStripSafeAreaView` *outside* the `NavigationContainer`'s screens (e.g. around the whole container), so it covers the full window.

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

### `<StatusStripProvider expandedMinWidth? iconsOffset? topStripLeftGap?>`

Wrap the app once, inside `SafeAreaProvider`. All props are optional:

| Prop | Default | What it controls |
|---|---|---|
| `expandedMinWidth` | **600** (`DEFAULT_EXPANDED_MIN_WIDTH`) | Minimum window width (pt) for the expanded layout. |
| `iconsOffset` | **110** (`DEFAULT_STATUS_ICONS_OFFSET`) | How far down the right strip its content starts, below the camera, time and wifi. |
| `topStripLeftGap` | **12** (`DEFAULT_TOP_STRIP_LEFT_GAP`) | Gap from the left edge to the content when the strip runs across the top. |

```tsx
<StatusStripProvider expandedMinWidth={700} iconsOffset={140} topStripLeftGap={20}>
```

`useScreenLayout()` and `useStatusStrip()` also work without a provider; they then use the defaults. `StatusStripPortal` needs a provider (it warns in development without one).

### `<StatusStripSafeAreaView {...ViewProps}>`

Use it as the root view. It fills the window, pads its children into the safe area, and renders the current strip content in the padding: as a column under the wifi icon (`'right'`), or as a row beside the clock (`'top'`). With no strip it renders nothing extra.

### `<StatusStripPortal enabled?>`

Declares the strip content from any depth. It renders nothing in place. The most recently enabled portal wins, and when it unmounts or is disabled the previous one comes back. With react-navigation, pass `enabled={useIsFocused()}`.

The content is rendered at the provider, so it sees the provider's React context, not the portal's (same as other portal libraries). Pass callbacks and values in as props or closures.

### Constants and types

```ts
import {
  DEFAULT_EXPANDED_MIN_WIDTH,  // 600
  DEFAULT_STATUS_ICONS_OFFSET, // 110
  DEFAULT_TOP_STRIP_LEFT_GAP,  // 12
  type ScreenLayout,           // { width, height, isExpanded, orientation }
  type Orientation,            // 'portrait' | 'landscape'
  type StatusStrip,            // StatusStripPlacement | null
  type StatusStripPlacement,   // 'right' | 'top'
  type StatusStripProviderProps,
  type StatusStripPortalProps,
  type UseScreenLayoutOptions,
} from 'react-native-duo-layout';
```

Use the defaults to adjust relative to them, e.g. `iconsOffset={DEFAULT_STATUS_ICONS_OFFSET + 20}`.

## Why a provider? (tappability)

On iOS and Android a touch only reaches a view if it is inside **every ancestor's bounds**. Screen content normally lives inside the safe-area padding, so a button pushed into the strip from there (with negative margins or `overflow: visible`) is drawn but never gets taps.

The strip content therefore has to be rendered by a view that covers the whole window: `StatusStripSafeAreaView`. If one root component owned all the state you wouldn't need a provider. You could render the toolbar as that root's direct child. But nested screens (a chat screen, a navigation stack screen) can't reach the root. `StatusStripPortal` lets them declare the content, and the provider carries it up to the root.

## Developing locally

Scripts:

```sh
npm test          # jest
npm run typecheck # tsc
npm run lint      # eslint
npm run build     # bob → lib/
```

To try changes in an app without publishing, add it as `"react-native-duo-layout": "file:../react-native-duo-layout"` and point Metro at the folder. Metro has to watch it, use the app's single copy of React (the library's own `node_modules` has a dev copy), and load the TypeScript source so you don't need to rebuild:

```js
// metro.config.js in the app
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const duoLayoutRoot = path.resolve(__dirname, '../react-native-duo-layout');
const escape = p => p.replace(/[/\\.]/g, '\\$&');

const config = {
  watchFolders: [duoLayoutRoot],
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    blockList: [
      new RegExp(`^${escape(path.join(duoLayoutRoot, 'node_modules'))}\\/.*$`),
    ],
    resolveRequest: (context, moduleName, platform) =>
      moduleName === 'react-native-duo-layout'
        ? { type: 'sourceFile', filePath: path.join(duoLayoutRoot, 'src/index.ts') }
        : context.resolveRequest(context, moduleName, platform),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

Apps installing the published package from npm need none of this.

## License

MIT
