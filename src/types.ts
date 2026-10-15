export type Orientation = 'portrait' | 'landscape';

export type ScreenLayout = {
  /** Window width in points, rounded. */
  width: number;
  /** Window height in points, rounded. */
  height: number;
  /**
   * true  → Duo unfolded, iPad, or a normal phone in landscape
   * false → Duo folded, or a normal phone in portrait
   */
  isExpanded: boolean;
  orientation: Orientation;
};

/** Where the iPhone Duo's status bar strip (time, wifi) currently is. */
export type StatusStripPlacement = 'right' | 'top';

/** The strip's placement, or null when there is no strip we can use. */
export type StatusStrip = StatusStripPlacement | null;

/**
 * The hinge's position:
 * 'closed', 'partiallyOpen' (half-folded), 'fullyOpen', 'unknown' (no
 * reading yet, or not supported) or 'unavailable' (the app left the screen
 * that reports the hinge).
 */
export type HingeStatus =
  | 'closed'
  | 'partiallyOpen'
  | 'fullyOpen'
  | 'unknown'
  | 'unavailable';

export type Hinge = {
  status: HingeStatus;
  /** Hinge angle in degrees, or null when there is no reading. */
  angle: number | null;
};
