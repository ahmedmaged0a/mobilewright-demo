export type Platform = 'ios' | 'android';

export type PerPlatform<T> = Readonly<Record<Platform, T>>;

export function resolvePlatform(value: string | undefined): Platform {
  if (value === 'ios' || value === 'android') {
    return value;
  }
  throw new Error(
    `Unsupported platform "${String(value)}": set use.platform to "ios" or "android" in the project config.`,
  );
}
