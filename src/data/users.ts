import type { PerPlatform } from '../helpers/platform.ts';

export interface Credentials {
  readonly username: string;
  readonly password: string;
}

/** Public demo accounts, printed on the app's own login screen. */
export const users = {
  standard: { username: 'bod@example.com', password: '10203040' },
  /** Rejected by the Android build only; the iOS build has no locked-out account. */
  lockedOut: { username: 'alice@example.com', password: '10203040' },
} as const satisfies Record<string, Credentials>;

export const loginErrors = {
  usernameRequired: { android: 'Username is required', ios: 'Username is required' },
  passwordRequired: { android: 'Enter Password', ios: 'Password is required' },
} as const satisfies Record<string, PerPlatform<string>>;

/** Shown by the Android build only. */
export const lockedOutError = 'Sorry this user has been locked out.';
