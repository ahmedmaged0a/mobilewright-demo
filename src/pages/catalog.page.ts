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

  productTitle(product: Product): Locator {
    return this.screen.getByText(this.pick(product.name));
  }

  async openProduct(product: Product): Promise<ProductDetailsPage> {
    const name = this.pick(product.name);
    return step(`Open product "${name}"`, async () => {
      const title = this.productTitle(product);
      await title.scrollIntoViewIfNeeded();
      await (await this.tapTargetFor(title)).tap();
      return new ProductDetailsPage(this.screen, this.platform).waitUntilLoaded();
    });
  }

  /** iOS opens a product from anywhere in its cell; Android only from the image above the title. */
  private async tapTargetFor(title: Locator): Promise<Locator> {
    if (this.platform === 'android') {
      return closestAbove(title, this.screen.getByTestId(androidId('productIV')));
    }
    return title;
  }
}
