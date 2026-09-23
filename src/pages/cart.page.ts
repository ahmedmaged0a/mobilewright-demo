import { expect } from '@mobilewright/test';
import type { Locator } from 'mobilewright';
import type { Product } from '../data/products.ts';
import { androidId } from '../helpers/android.ts';
import type { PerPlatform } from '../helpers/platform.ts';
import { step } from '../helpers/reporting.ts';
import { formatItemCount, parsePrice } from '../helpers/text.ts';
import { BasePage } from './base.page.ts';
import { CatalogPage } from './catalog.page.ts';

export class CartPage extends BasePage {
  protected readonly screenName = 'Cart';

  protected readonly loadedIndicator = this.select({
    android: (screen) => screen.getByText('My Cart').or(screen.getByText('No Items')),
    ios: (screen) => screen.getByTestId('Cart-screen'),
  });

  private readonly emptyCart_lbl = this.screen.getByText('No Items');

  private readonly itemCount_lbl = this.select({
    android: (screen) => screen.getByTestId(androidId('itemsTV')),
    ios: (screen) => screen.getByText(/^\d+ Items$/),
  });

  private readonly totalPrice_lbl = this.select({
    android: (screen) => screen.getByTestId(androidId('totalPriceTV')),
    ios: (screen) => screen.getByText(/^\$\d+\.\d{2}$/),
  });

  private readonly removeItem_btn = this.screen.getByText('Remove Item');

  private readonly goShopping_btn = this.select({
    android: (screen) => screen.getByTestId(androidId('shoppingBt')),
    ios: (screen) => screen.getByTestId('GoShopping'),
  });

  private item(product: Product): Locator {
    return this.screen.getByText(this.pick(product.name));
  }

  async expectEmpty(): Promise<void> {
    await step('Expect cart to be empty', () => expect(this.emptyCart_lbl).toBeVisible());
  }

  async expectItemVisible(product: Product): Promise<void> {
    await step(`Expect "${this.pick(product.name)}" in the cart`, () =>
      expect(this.item(product)).toBeVisible(),
    );
  }

  async expectItemCount(count: number): Promise<void> {
    await step(`Expect cart count ${formatItemCount(count)}`, () =>
      expect(this.itemCount_lbl).toHaveText(formatItemCount(count)),
    );
  }

  async expectTotalCloseTo(expected: number | PerPlatform<number>): Promise<void> {
    const amount = typeof expected === 'number' ? expected : this.pick(expected);
    await step(`Expect cart total close to ${amount}`, async () => {
      expect(await this.totalPrice()).toBeCloseTo(amount, 2);
    });
  }

  private async totalPrice(): Promise<number> {
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
