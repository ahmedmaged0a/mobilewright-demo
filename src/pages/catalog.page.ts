import { expect } from '@mobilewright/test';
import type { Locator } from 'mobilewright';
import { catalogCopy } from '../data/copy.ts';
import type { Product } from '../data/products.ts';
import { androidId } from '../helpers/android.ts';
import { closestAbove } from '../helpers/geometry.ts';
import { step } from '../helpers/reporting.ts';
import { BasePage } from './base.page.ts';
import { ProductDetailsPage } from './product-details.page.ts';

export class CatalogPage extends BasePage {
  protected readonly screenName = 'Catalog';

  // --- Locators ---

  protected readonly loadedIndicator = this.select({
    android: (screen) => screen.getByText(catalogCopy.productsHeader),
    ios: (screen) => screen.getByTestId('Catalog-screen'),
  });

  private readonly product_img = this.select({
    android: (screen) => screen.getByTestId(androidId('productIV')),
    ios: (screen) => screen.getByTestId('ProductItem'),
  });

  private productTitle_lbl(product: Product): Locator {
    return this.screen.getByText(this.pick(product.name), { exact: true });
  }

  // --- Assertions ---

  async expectProductVisible(product: Product): Promise<void> {
    await step(`Expect product "${this.pick(product.name)}" to be visible`, async () => {
      await this.revealProduct(product);
      await expect(this.productTitle_lbl(product)).toBeVisible();
    });
  }

  // --- Actions ---

  async openProduct(product: Product): Promise<ProductDetailsPage> {
    const name = this.pick(product.name);
    return step(`Open product "${name}"`, async () => {
      await this.revealProduct(product);
      await (await this.tapTargetFor(product)).tap();
      return new ProductDetailsPage(this.screen, this.platform).waitUntilLoaded();
    });
  }

  private async revealProduct(product: Product): Promise<void> {
    const title = this.productTitle_lbl(product);
    if (await title.isVisible({ timeout: 1_500 }).catch(() => false)) {
      return;
    }

    try {
      await title.scrollIntoViewIfNeeded({ maxSwipes: 40, direction: 'up' });
    } catch {
      await this.reveal(title);
    }
    await title.waitFor({ state: 'visible', timeout: 10_000 });
  }

  private async tapTargetFor(product: Product): Promise<Locator> {
    const title = this.productTitle_lbl(product);
    if (this.platform === 'android') {
      try {
        return await closestAbove(title, this.product_img);
      } catch {
        return title;
      }
    }
    return title;
  }
}
