import { expect } from '@mobilewright/test';
import type { Locator } from 'mobilewright';
import type { Product } from '../data/products.ts';
import { androidId } from '../helpers/android.ts';
import type { PerPlatform } from '../helpers/platform.ts';
import { step } from '../helpers/reporting.ts';
import { formatPrice } from '../helpers/text.ts';
import { BasePage } from './base.page.ts';

export class ProductDetailsPage extends BasePage {
  protected readonly screenName = 'Product details';

  private readonly addToCart_btn = this.select({
    android: (screen) => screen.getByLabel('Tap to add product to cart'),
    ios: (screen) => screen.getByTestId('AddToCart'),
  });

  protected readonly loadedIndicator = this.addToCart_btn;

  private readonly price_lbl = this.select({
    android: (screen) => screen.getByTestId(androidId('priceTV')),
    ios: (screen) => screen.getByTestId('Price'),
  });

  private productTitle(product: Product): Locator {
    return this.screen.getByText(this.pick(product.name));
  }

  async expectProductVisible(product: Product): Promise<void> {
    await step(`Expect product "${this.pick(product.name)}" to be visible`, () =>
      expect(this.productTitle(product)).toBeVisible(),
    );
  }

  async expectPrice(price: number | PerPlatform<number>): Promise<void> {
    const amount = typeof price === 'number' ? price : this.pick(price);
    await step(`Expect price ${formatPrice(amount)}`, () =>
      expect(this.price_lbl).toHaveText(formatPrice(amount)),
    );
  }

  async tapAddToCartBtn(): Promise<void> {
    await this.reveal(this.addToCart_btn);
    await expect(this.addToCart_btn).toBeVisible({ timeout: 10_000 });
    await this.addToCart_btn.tap();
  }

  async addToCart(): Promise<void> {
    await step('Add product to cart', async () => {
      await this.tapAddToCartBtn();
      // Let the cart badge update before the next navigation (Android drops rapid taps otherwise).
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  }
}
