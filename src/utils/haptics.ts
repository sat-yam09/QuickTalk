/**
 * Mobile haptic feedback engine for QuickTalk.
 * Maps actions to standard Android / iOS haptic feedback patterns.
 */

export const HAPTIC_PATTERNS = {
  // Light selection click (10ms): buttons, dice rolls, theme choices, toggle switches
  selection: [10],
  // Medium impact (18ms): message sent, connection requested, connect tapped
  impact: [18],
  // Success pattern (12ms tick, 40ms pause, 20ms confirm): connection accepted, peer joined
  success: [12, 40, 20],
  // Warning pattern (30ms, 50ms pause, 30ms): reject connection, error, delete history
  warning: [30, 50, 30],
} as const;

export function triggerHaptic(pattern: readonly number[] | number): boolean {
  if (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      const vibrateArg = Array.isArray(pattern) ? Array.from(pattern) : (pattern as number);
      return navigator.vibrate(vibrateArg);
    } catch {
      return false;
    }
  }
  return false;
}

export const haptics = {
  selection: () => triggerHaptic(HAPTIC_PATTERNS.selection),
  impact: () => triggerHaptic(HAPTIC_PATTERNS.impact),
  success: () => triggerHaptic(HAPTIC_PATTERNS.success),
  warning: () => triggerHaptic(HAPTIC_PATTERNS.warning),
};
