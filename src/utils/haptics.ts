/**
 * Haptic Feedback — Advanced Vibration Patterns
 * 
 * Uses the Vibration API (mobile browsers).
 * No-op on desktop. No pressure — purely sensory feedback.
 */

/** Short, crisp pulse for correct answers. */
export const hapticSuccess = () => {
  if (!('vibrate' in navigator)) return;
  navigator.vibrate([40]);
};

/** Longer, distinct double-buzz for errors. */
export const hapticError = () => {
  if (!('vibrate' in navigator)) return;
  navigator.vibrate([80, 60, 120]);
};

/** Soft tap for button presses / UI interactions. */
export const hapticTap = () => {
  if (!('vibrate' in navigator)) return;
  navigator.vibrate([15]);
};

/** Celebration pattern for level completion. */
export const hapticCelebration = () => {
  if (!('vibrate' in navigator)) return;
  navigator.vibrate([30, 50, 30, 50, 80]);
};
