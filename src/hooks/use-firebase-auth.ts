// This hook is not in use as Firebase has been disabled.
// It returns a mock logged-out state to prevent app crashes.
// To re-enable, restore the previous version of this file.

export function useFirebaseAuth() {
  return [null, false, undefined] as const;
}
