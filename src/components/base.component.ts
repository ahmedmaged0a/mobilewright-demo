import type { Locator, Screen } from 'mobilewright';
import type { PerPlatform, Platform } from '../helpers/platform.ts';

type LocatorFactory = (_screen: Screen) => Locator;

/** Common base of pages and reusable UI components: knows the screen and the platform. */
export abstract class BaseComponent {
  /** Screen transitions on emulators and CI simulators take longer than a single action. */
  protected static readonly screenTimeout = 30_000;

  protected readonly screen: Screen;
  protected readonly platform: Platform;

  constructor(screen: Screen, platform: Platform) {
    this.screen = screen;
    this.platform = platform;
  }

  /** Builds the locator for the current platform from per-platform definitions. */
  protected select(locators: PerPlatform<LocatorFactory>): Locator {
    return locators[this.platform](this.screen);
  }

  /** Picks the current platform's variant of a value that differs between the builds. */
  protected pick<T>(values: PerPlatform<T>): T {
    return values[this.platform];
  }
}
