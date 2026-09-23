import type { Locator } from 'mobilewright';
import type { Product } from '../data/products.ts';
import { androidId } from '../helpers/android.ts';
import { step } from '../helpers/reporting.ts';
import { BasePage } from './base.page.ts';

export class ProductDetailsPage extends BasePage {
  protected readonly screenName = 'Product details';

  private readonly addToCart_btn = this.select({
    // The Android resource id `cartBt` is reused by the cart's checkout button, the label is not.
    android: (screen) => screen.getByLabel('Tap to add product to cart'),
    ios: (screen) => screen.getByTestId('AddToCart'),
  });

  protected readonly loadedIndicator = this.addToCart_btn;

  readonly price_lbl = this.select({
    android: (screen) => screen.getByTestId(androidId('priceTV')),
    ios: (screen) => screen.getByTestId('Price'),
  });

  productTitle(product: Product): Locator {
    return this.screen.getByText(this.pick(product.name));
  }

  async tapAddToCartBtn(): Promise<void> {
    await this.addToCart_btn.tap();
  }

  async addToCart(): Promise<void> {
    await step('Add product to cart', () => this.tapAddToCartBtn());
  }
}
