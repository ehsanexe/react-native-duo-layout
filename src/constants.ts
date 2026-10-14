// Screen sizes (in points):
//   iPhone Duo cover screen (folded):   466 x 678
//   iPhone Duo inner screen (unfolded): 669 x 951  (951 x 669 in landscape)
//   iPhone 17:                          402 x 874  (874 x 402 in landscape)
// Anything at least this wide gets the expanded (two-pane) layout.
export const DEFAULT_EXPANDED_MIN_WIDTH = 600;

// Room taken by the camera, time and wifi icon at the top of the right strip.
// Strip content starts below it.
export const DEFAULT_STATUS_ICONS_OFFSET = 160;

// Gap between the left edge and strip content when the strip runs across the
// top, so the content sits beside the time and wifi icon.
export const TOP_STRIP_LEFT_GAP = 12;
