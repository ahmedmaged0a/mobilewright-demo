import { products } from '../src/data/products.ts';
import { test } from '../src/fixtures/index.ts';
import { allure, Severity } from '../src/helpers/reporting.ts';

test.describe('Catalog', { annotation: [allure.epic('Shopping'), allure.feature('Catalog')] }, () => {
  test(
    'Check that product list is shown when the app launches',
    {
      tag: ['@ui', '@sanity', '@smoke', '@regression'],
      annotation: [allure.story('Browse products'), allure.severity(Severity.BLOCKER)],
    },
    async ({ catalogPage }) => {
      await catalogPage.expectProductVisible(products.backpack);
    },
  );

  test(
    'Check that backpack details are shown when the product is opened',
    {
      tag: ['@ui', '@regression'],
      annotation: [allure.story('View product details'), allure.severity(Severity.CRITICAL)],
    },
    async ({ catalogPage }) => {
      const details = await catalogPage.openProduct(products.backpack);

      await details.expectProductVisible(products.backpack);
      await details.expectPrice(products.backpack.price);
    },
  );

  test(
    'Check that companion product details are shown when the product is opened',
    {
      tag: ['@ui', '@regression'],
      annotation: [allure.story('View product details'), allure.severity(Severity.CRITICAL)],
    },
    async ({ catalogPage }) => {
      const details = await catalogPage.openProduct(products.companion);

      await details.expectProductVisible(products.companion);
      await details.expectPrice(products.companion.price);
    },
  );
});
