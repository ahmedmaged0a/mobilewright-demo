import type { Locator, Screen } from 'mobilewright';
import type { PerPlatform, Platform } from '../helpers/platform.ts';

type LocatorFactory = (_screen: Screen) => Locator;

export abstract class BaseComponent {
  protected static readonly screenTimeout = 30_000;

  protected readonly screen: Screen;
  protected readonly platform: Platform;

  constructor(screen: Screen, platform: Platform) {
    this.screen = screen;
    this.platform = platform;
  }

  protected select(locators: PerPlatform<LocatorFactory>): Locator {
    return locators[this.platform](this.screen);
  }

  protected pick<T>(values: PerPlatform<T>): T {
    return values[this.platform];
  }

  protected async reveal(target: Locator): Promise<void> {
    if (await target.isVisible()) {
      return;
    }

    const appeared = await target
      .waitFor({ state: 'visible', timeout: 3_000 })
      .then(() => true)
      .catch(() => false);
    if (appeared) {
      return;
    }

    for (let attempt = 0; attempt < 25; attempt += 1) {
      await this.screen.swipe('up', { duration: 400 });
      if (await target.isVisible()) {
        return;
      }
    }

    await target.waitFor({ state: 'visible', timeout: BaseComponent.screenTimeout });
  }
}
