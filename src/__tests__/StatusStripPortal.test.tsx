import { useState, type ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import {
  StatusStripPortal,
  StatusStripProvider,
  StatusStripSafeAreaView,
} from '..';

// Screen size and safe-area insets for the current test, read by the mocks.
const mockScreen = {
  width: 466,
  height: 678,
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({
    width: mockScreen.width,
    height: mockScreen.height,
    scale: 3,
    fontScale: 1,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockScreen.insets,
}));

function mockStrip(strip: 'right' | null) {
  mockScreen.insets = {
    top: 0,
    bottom: 0,
    left: 0,
    right: strip === 'right' ? 44 : 0,
  };
}

function App({ children }: { children: ReactNode }) {
  return (
    <StatusStripProvider>
      <StatusStripSafeAreaView>{children}</StatusStripSafeAreaView>
    </StatusStripProvider>
  );
}

it('renders portal content in the strip host, where it is tappable', () => {
  mockStrip('right');
  const onPress = jest.fn();
  render(
    <App>
      <StatusStripPortal>
        <Pressable onPress={onPress}>
          <Text>Back</Text>
        </Pressable>
      </StatusStripPortal>
    </App>,
  );

  expect(screen.getByTestId('status-strip-host')).toHaveTextContent('Back');
  fireEvent.press(screen.getByText('Back'));
  expect(onPress).toHaveBeenCalled();
});

it('shows the most recent portal and falls back when it unmounts', () => {
  mockStrip('right');
  let setOpen: (open: boolean) => void = () => {};
  function Screens() {
    const [open, setOpenState] = useState(false);
    setOpen = setOpenState;
    return (
      <>
        <StatusStripPortal>
          <Text>Tabs</Text>
        </StatusStripPortal>
        {open && (
          <StatusStripPortal>
            <Text>Chat back</Text>
          </StatusStripPortal>
        )}
      </>
    );
  }
  render(
    <App>
      <Screens />
    </App>,
  );

  const host = () => screen.getByTestId('status-strip-host');
  expect(host()).toHaveTextContent('Tabs');
  act(() => setOpen(true));
  expect(host()).toHaveTextContent('Chat back');
  act(() => setOpen(false));
  expect(host()).toHaveTextContent('Tabs');
});

it('keeps a portal in place when its content updates', () => {
  mockStrip('right');
  let setCount: (n: number) => void = () => {};
  function Counter() {
    const [count, setCountState] = useState(0);
    setCount = setCountState;
    return (
      <StatusStripPortal>
        <Text>Count {count}</Text>
      </StatusStripPortal>
    );
  }
  render(
    <App>
      <Counter />
      <StatusStripPortal>
        <Text>Top</Text>
      </StatusStripPortal>
    </App>,
  );

  act(() => setCount(1));
  expect(screen.getByTestId('status-strip-host')).toHaveTextContent('Top');
});

it('ignores disabled portals', () => {
  mockStrip('right');
  render(
    <App>
      <StatusStripPortal>
        <Text>Focused</Text>
      </StatusStripPortal>
      <StatusStripPortal enabled={false}>
        <Text>Unfocused</Text>
      </StatusStripPortal>
    </App>,
  );
  expect(screen.getByTestId('status-strip-host')).toHaveTextContent('Focused');
});

it('renders no host when there is no strip', () => {
  mockStrip(null);
  render(
    <App>
      <StatusStripPortal>
        <Text>Back</Text>
      </StatusStripPortal>
    </App>,
  );
  expect(screen.queryByTestId('status-strip-host')).toBeNull();
  expect(screen.queryByText('Back')).toBeNull();
});

it('places the strip content using the provider settings', () => {
  mockStrip('right');
  render(
    <StatusStripProvider iconsOffset={140}>
      <StatusStripSafeAreaView>
        <StatusStripPortal>
          <Text>Back</Text>
        </StatusStripPortal>
      </StatusStripSafeAreaView>
    </StatusStripProvider>,
  );
  expect(screen.getByTestId('status-strip-host')).toHaveStyle({ top: 140 });
});

it('uses topStripLeftGap when the strip runs across the top', () => {
  mockScreen.width = 669;
  mockScreen.height = 951;
  mockScreen.insets = { top: 44, right: 0, bottom: 0, left: 0 };
  render(
    <StatusStripProvider topStripLeftGap={20}>
      <StatusStripSafeAreaView>
        <StatusStripPortal>
          <Text>Back</Text>
        </StatusStripPortal>
      </StatusStripSafeAreaView>
    </StatusStripProvider>,
  );
  expect(screen.getByTestId('status-strip-host')).toHaveStyle({ left: 20 });
  mockScreen.width = 466;
  mockScreen.height = 678;
});
