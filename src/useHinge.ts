import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import type { Hinge } from './types';

// The native module (ios/DuoLayoutHinge.swift) only exists on iOS.
const nativeModule = NativeModules.DuoLayoutHinge;
const emitter = nativeModule ? new NativeEventEmitter(nativeModule) : null;

const UNKNOWN: Hinge = { status: 'unknown', angle: null };

// Kept here so a component that mounts later starts from the current state
// instead of 'unknown'.
let latest = UNKNOWN;
emitter?.addListener('hingeChange', (hinge: Hinge) => {
  latest = hinge;
});

// Reads the iPhone Duo's hinge (UIHingeInteraction, iOS 27.1+) and re-renders
// when it moves. Stays { status: 'unknown', angle: null } on older iOS, other
// devices and Android.
export default function useHinge(): Hinge {
  const [hinge, setHinge] = useState(latest);

  useEffect(() => {
    setHinge(latest);
    const subscription = emitter?.addListener('hingeChange', setHinge);
    return () => subscription?.remove();
  }, []);

  return hinge;
}
