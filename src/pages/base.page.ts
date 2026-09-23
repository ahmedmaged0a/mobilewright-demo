import type { Locator } from 'mobilewright';
import { BaseComponent } from '../components/base.component.ts';
import { step } from '../helpers/reporting.ts';

export abstract class BasePage extends BaseComponent {
  protected abstract readonly screenName: string;
  protected abstract readonly loadedIndicator: Locator;

  async waitUntilLoaded(): Promise<this> {
    await step(`Wait for ${this.screenName} screen`, () =>
      this.loadedIndicator.waitFor({ state: 'visible', timeout: BasePage.screenTimeout }),
    );
    return this;
  }
}
