import { products } from '../src/data/products.ts';
import { expect, test } from '../src/fixtures/index.ts';
import { allure, attachScreenshot, Severity } from '../src/helpers/reporting.ts';
import { formatItemCount } from '../src/helpers/text.ts';

test.describe('Cart', { annotation: [allure.epic('Shopping'), allure.feature('Cart')] }, () => {
  test(
    'Check that empty cart leads back to the catalog when go shopping is tapped',
    {
      tag: ['@ui', '@regression'],
      annotation: [allure.story('Empty cart'), allure.severity(Severity.NORMAL)],
    },
    async ({ navigation }) => {
      const cart = await navigation.openCart();
      await expect(cart.emptyCart_lbl).toBeVisible();

      const catalog = await cart.goShopping();

      await expect(catalog.productTitle(products.backpack)).toBeVisible();
    },
  );

  test(
    'Check that backpack appears in cart when added from details',
    {
      tag: ['@ui', '@sanity', '@smoke', '@regression', '@e2e'],
      annotation: [allure.story('Add to cart'), allure.severity(Severity.BLOCKER)],
    },
    async ({ catalogPage, navigation, screen }) => {
      const details = await catalogPage.openProduct(products.backpack);
      await details.addToCart();

      const cart = await navigation.openCart();

      await expect(cart.item(products.backpack)).toBeVisible();
      await expect(cart.itemCount_lbl).toHaveText(formatItemCount(1));
      await attachScreenshot(screen, 'cart-with-backpack');
    },
  );

  test(
    'Check that cart total matches sum when several products are added',
    {
      tag: ['@ui', '@regression', '@e2e'],
      annotation: [allure.story('Cart total'), allure.severity(Severity.CRITICAL)],
    },
    async ({ catalogPage, navigation }) => {
      const basket = [products.backpack, products.bikeLight];
      for (const product of basket) {
        const details = await catalogPage.openProduct(product);
        await details.addToCart();
        await navigation.openCatalog();
      }

      const cart = await navigation.openCart();

      await expect(cart.itemCount_lbl).toHaveText(formatItemCount(basket.length));
      const expectedTotal = basket.reduce((sum, product) => sum + product.price, 0);
      expect(await cart.totalPrice()).toBeCloseTo(expectedTotal, 2);
    },
  );

  test(
    'Check that cart is empty when its only product is removed',
    {
      tag: ['@ui', '@regression'],
      annotation: [allure.story('Remove from cart'), allure.severity(Severity.NORMAL)],
    },
    async ({ catalogPage, navigation }) => {
      const details = await catalogPage.openProduct(products.bikeLight);
      await details.addToCart();
      const cart = await navigation.openCart();

      await cart.removeFirstItem();

      await expect(cart.emptyCart_lbl).toBeVisible();
    },
  );
});
