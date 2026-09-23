import { products, totalOf } from '../src/data/products.ts';
import { test } from '../src/fixtures/index.ts';
import { allure, attachScreenshot, Severity } from '../src/helpers/reporting.ts';

test.describe('Cart', { annotation: [allure.epic('Shopping'), allure.feature('Cart')] }, () => {
  test(
    'Check that empty cart leads back to the catalog when go shopping is tapped',
    {
      tag: ['@ui', '@regression'],
      annotation: [allure.story('Empty cart'), allure.severity(Severity.NORMAL)],
    },
    async ({ navigation }) => {
      const cart = await navigation.openCart();
      await cart.expectEmpty();

      const catalog = await cart.goShopping();

      await catalog.expectProductVisible(products.backpack);
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

      await cart.expectItemVisible(products.backpack);
      await cart.expectItemCount(1);
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
      const basket = [products.backpack, products.companion];
      let catalog = catalogPage;
      for (const product of basket) {
        const details = await catalog.openProduct(product);
        await details.addToCart();
        catalog = await navigation.openCatalog();
      }

      const cart = await navigation.openCart();
      const expected = totalOf(basket);

      await cart.expectItemCount(basket.length);
      await cart.expectTotalCloseTo(expected);
    },
  );

  test(
    'Check that cart is empty when its only product is removed',
    {
      tag: ['@ui', '@regression'],
      annotation: [allure.story('Remove from cart'), allure.severity(Severity.NORMAL)],
    },
    async ({ catalogPage, navigation }) => {
      const details = await catalogPage.openProduct(products.companion);
      await details.addToCart();
      const cart = await navigation.openCart();

      await cart.removeFirstItem();

      await cart.expectEmpty();
    },
  );
});
