import type { Locator } from 'mobilewright';
import type { Product } from '../data/products.ts';
import { androidId } from '../helpers/android.ts';
import { step } from '../helpers/reporting.ts';
import { parsePrice } from '../helpers/text.ts';
import { BasePage } from './base.page.ts';
import { CatalogPage } from './catalog.page.ts';

export class CartPage extends BasePage {
  protected readonly screenName = 'Cart';

  protected readonly loadedIndicator = this.select({
    // The Android cart swaps its whole layout when empty, so either state proves the screen is shown.
    android: (screen) => screen.getByText('My Cart').or(screen.getByText('No Items')),
    ios: (screen) => screen.getByTestId('Cart-screen'),
  });

  readonly emptyCart_lbl = this.screen.getByText('No Items');

  /** Renders `<n> Items` on both platforms. */
  readonly itemCount_lbl = this.select({
    android: (screen) => screen.getByTestId(androidId('itemsTV')),
    ios: (screen) => screen.getByText(/^\d+ Items$/),
  });

  private readonly totalPrice_lbl = this.select({
    android: (screen) => screen.getByTestId(androidId('totalPriceTV')),
    // iOS renders the total as `$59.98`, without the space its item prices have, and gives it no id.
    ios: (screen) => screen.getByText(/^\$\d+\.\d{2}$/),
  });

  private readonly removeItem_btn = this.screen.getByText('Remove Item');

  private readonly goShopping_btn = this.select({
    android: (screen) => screen.getByTestId(androidId('shoppingBt')),
    ios: (screen) => screen.getByTestId('GoShopping'),
  });

  item(product: Product): Locator {
    return this.screen.getByText(this.pick(product.name));
  }

  async totalPrice(): Promise<number> {
    return step('Read cart total', async () => parsePrice(await this.totalPrice_lbl.getText()));
  }

  async tapRemoveItemBtn(): Promise<void> {
    await this.removeItem_btn.first().tap();
  }

  async removeFirstItem(): Promise<void> {
    await step('Remove first cart item', () => this.tapRemoveItemBtn());
  }

  async tapGoShoppingBtn(): Promise<void> {
    await this.goShopping_btn.tap();
  }

  async goShopping(): Promise<CatalogPage> {
    return step('Go shopping', async () => {
      await this.tapGoShoppingBtn();
      return new CatalogPage(this.screen, this.platform).waitUntilLoaded();
    });
  }
}
