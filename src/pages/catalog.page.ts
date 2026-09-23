import { expect } from '@mobilewright/test';
import type { Locator } from 'mobilewright';
import type { Product } from '../data/products.ts';
import { androidId } from '../helpers/android.ts';
import { closestAbove } from '../helpers/geometry.ts';
import { step } from '../helpers/reporting.ts';
import { BasePage } from './base.page.ts';
import { ProductDetailsPage } from './product-details.page.ts';

export class CatalogPage extends BasePage {
  protected readonly screenName = 'Catalog';

  protected readonly loadedIndicator = this.select({
    android: (screen) => screen.getByText('Products'),
    ios: (screen) => screen.getByTestId('Catalog-screen'),
  });

  private productTitle(product: Product): Locator {
    return this.screen.getByText(this.pick(product.name));
  }

  async expectProductVisible(product: Product): Promise<void> {
    await step(`Expect product "${this.pick(product.name)}" to be visible`, () =>
      expect(this.productTitle(product)).toBeVisible(),
    );
  }

  async openProduct(product: Product): Promise<ProductDetailsPage> {
    const name = this.pick(product.name);
    return step(`Open product "${name}"`, async () => {
      const title = this.productTitle(product);
      await this.reveal(title);
      await (await this.tapTargetFor(title)).tap();
      return new ProductDetailsPage(this.screen, this.platform).waitUntilLoaded();
    });
  }

  private async tapTargetFor(title: Locator): Promise<Locator> {
    if (this.platform === 'android') {
      return closestAbove(title, this.screen.getByTestId(androidId('productIV')));
    }
    return title;
  }
}
