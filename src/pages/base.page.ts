import type { Locator } from 'mobilewright';
import { BaseComponent } from '../components/base.component.ts';
import { step } from '../helpers/reporting.ts';

export abstract class BasePage extends BaseComponent {
  /** Human-readable screen name used in report steps. */
  protected abstract readonly screenName: string;
  /** Element whose presence proves this screen is displayed. */
  protected abstract readonly loadedIndicator: Locator;

  async waitUntilLoaded(): Promise<this> {
    await step(`Wait for ${this.screenName} screen`, () =>
      this.loadedIndicator.waitFor({ state: 'visible', timeout: BasePage.screenTimeout }),
    );
    return this;
  }
}
