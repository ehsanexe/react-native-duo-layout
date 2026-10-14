import { Platform } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { StatusStripProvider, useScreenLayout, useStatusStrip } from '..';

type Insets = typeof mockScreen.insets;

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

function setScreen(width: number, height: number, insets: Partial<Insets>) {
  mockScreen.width = width;
  mockScreen.height = height;
  mockScreen.insets = { top: 0, right: 0, bottom: 0, left: 0, ...insets };
}

afterEach(() => {
  Object.defineProperty(Platform, 'isPad', {
    value: false,
    configurable: true,
  });
  Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
});

describe('useScreenLayout', () => {
  it('is compact on the folded Duo cover screen', () => {
    setScreen(466, 678, {});
    const { result } = renderHook(() => useScreenLayout());
    expect(result.current).toEqual({
      width: 466,
      height: 678,
      isExpanded: false,
      orientation: 'portrait',
    });
  });

  it('is expanded on the unfolded Duo inner screen', () => {
    setScreen(951.4, 669, {});
    const { result } = renderHook(() => useScreenLayout());
    expect(result.current).toEqual({
      width: 951,
      height: 669,
      isExpanded: true,
      orientation: 'landscape',
    });
  });

  it('takes expandedMinWidth from options, then the provider', () => {
    setScreen(669, 951, {});
    expect(
      renderHook(() => useScreenLayout({ expandedMinWidth: 700 })).result
        .current.isExpanded,
    ).toBe(false);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <StatusStripProvider expandedMinWidth={700}>
        {children}
      </StatusStripProvider>
    );
    expect(
      renderHook(() => useScreenLayout(), { wrapper }).result.current
        .isExpanded,
    ).toBe(false);
  });
});

describe('useStatusStrip', () => {
  it("is 'right' when only the right side is inset (Duo folded)", () => {
    setScreen(466, 678, { right: 44 });
    expect(renderHook(() => useStatusStrip()).result.current).toBe('right');
  });

  it("is 'top' on the unfolded Duo in portrait", () => {
    setScreen(669, 951, { top: 44 });
    expect(renderHook(() => useStatusStrip()).result.current).toBe('top');
  });

  it('is null on a normal phone in portrait', () => {
    setScreen(402, 874, { top: 62, bottom: 34 });
    expect(renderHook(() => useStatusStrip()).result.current).toBeNull();
  });

  it('is null on a normal phone in landscape (both sides inset)', () => {
    setScreen(874, 402, { left: 62, right: 62, bottom: 21 });
    expect(renderHook(() => useStatusStrip()).result.current).toBeNull();
  });

  it('is null on an iPad', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
    Object.defineProperty(Platform, 'isPad', {
      value: true,
      configurable: true,
    });
    setScreen(820, 1180, { top: 24 });
    expect(renderHook(() => useStatusStrip()).result.current).toBeNull();
  });
});
