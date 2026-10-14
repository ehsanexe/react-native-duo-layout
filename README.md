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

Use this to render something on the status strip, from any screen:

```tsx
<StatusStripPortal>
  <BackButton onPress={goBack} />
</StatusStripPortal>
```

Set `enabled={false}` to hide it.

### Constants

```ts
import {
  DEFAULT_EXPANDED_MIN_WIDTH,  // 600
  DEFAULT_STATUS_ICONS_OFFSET, // 110
  DEFAULT_TOP_STRIP_LEFT_GAP,  // 12
} from 'react-native-duo-layout';
```

Use the defaults to adjust relative to them, e.g. `iconsOffset={DEFAULT_STATUS_ICONS_OFFSET + 20}`.

## License

MIT
