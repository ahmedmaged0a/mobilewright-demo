import { expect } from '@mobilewright/test';
import type { Locator } from 'mobilewright';
import { productDetailsCopy } from '../data/copy.ts';
import type { Product } from '../data/products.ts';
import { androidId } from '../helpers/android.ts';
import type { PerPlatform } from '../helpers/platform.ts';
import { step } from '../helpers/reporting.ts';
import { formatPrice } from '../helpers/text.ts';
import { BasePage } from './base.page.ts';

export class ProductDetailsPage extends BasePage {
  protected readonly screenName = 'Product details';

  // --- Locators ---

  private readonly addToCart_btn = this.select({
    android: (screen) => screen.getByLabel(productDetailsCopy.addToCartLabel),
    ios: (screen) => screen.getByTestId('AddToCart'),
  });

  private readonly price_lbl = this.select({
    android: (screen) => screen.getByTestId(androidId('priceTV')),
    ios: (screen) => screen.getByTestId('Price'),
  });

  protected readonly loadedIndicator = this.addToCart_btn;

  private productTitle_lbl(product: Product): Locator {
    return this.screen.getByText(this.pick(product.name));
  }

  // --- Assertions ---

  async expectProductVisible(product: Product): Promise<void> {
    await step(`Expect product "${this.pick(product.name)}" to be visible`, () =>
      expect(this.productTitle_lbl(product)).toBeVisible(),
    );
  }

  async expectPrice(price: number | PerPlatform<number>): Promise<void> {
    const amount = typeof price === 'number' ? price : this.pick(price);
    await step(`Expect price ${formatPrice(amount)}`, () =>
      expect(this.price_lbl).toHaveText(formatPrice(amount)),
    );
  }

  // --- Actions ---

  async tapAddToCartBtn(): Promise<void> {
    await this.reveal(this.addToCart_btn);
    await this.addToCart_btn.tap();
  }

  async addToCart(): Promise<void> {
    await step('Add product to cart', () => this.tapAddToCartBtn());
  }
}
