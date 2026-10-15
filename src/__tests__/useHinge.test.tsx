import { act, renderHook } from '@testing-library/react-native';

type Listener = (hinge: unknown) => void;

// Stands in for the native module: tests call emit() to move the hinge.
const mockListeners = new Set<Listener>();
function emit(hinge: unknown) {
  act(() => mockListeners.forEach(listener => listener(hinge)));
}

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.DuoLayoutHinge = {};
  return Object.setPrototypeOf(
    {
      NativeEventEmitter: class {
        addListener(_event: string, listener: Listener) {
          mockListeners.add(listener);
          return { remove: () => mockListeners.delete(listener) };
        }
      },
    },
    RN,
  );
});

// Loaded after the mock so it sees the fake native module.
const { useHinge } = require('..');

describe('useHinge', () => {
  it('starts unknown and follows hinge updates', () => {
    const { result } = renderHook(() => useHinge());
    expect(result.current).toEqual({ status: 'unknown', angle: null });

    emit({ status: 'partiallyOpen', angle: 128 });
    expect(result.current).toEqual({ status: 'partiallyOpen', angle: 128 });

    emit({ status: 'fullyOpen', angle: 180 });
    expect(result.current).toEqual({ status: 'fullyOpen', angle: 180 });
  });

  it('starts from the latest state when mounted later', () => {
    emit({ status: 'partiallyOpen', angle: 100 });
    const { result } = renderHook(() => useHinge());
    expect(result.current).toEqual({ status: 'partiallyOpen', angle: 100 });
  });

  it('stops listening when unmounted', () => {
    const { unmount } = renderHook(() => useHinge());
    const before = mockListeners.size;
    unmount();
    expect(mockListeners.size).toBe(before - 1);
  });
});
