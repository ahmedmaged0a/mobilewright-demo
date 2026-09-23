import { products } from '../src/data/products.ts';
import { lockedOutError, loginErrors, users } from '../src/data/users.ts';
import { expect, test } from '../src/fixtures/index.ts';
import { allure, Severity } from '../src/helpers/reporting.ts';

test.describe('Login', { annotation: [allure.epic('Account'), allure.feature('Login')] }, () => {
  test(
    'Check that catalog is shown when a standard user signs in',
    {
      tag: ['@ui', '@sanity', '@smoke', '@regression', '@e2e'],
      annotation: [allure.story('Successful login'), allure.severity(Severity.BLOCKER)],
    },
    async ({ navigation }) => {
      const login = await navigation.openLogin();

      const catalog = await login.loginAs(users.standard);

      await expect(catalog.productTitle(products.backpack)).toBeVisible();
    },
  );

  test(
    'Check that username error is shown when username is empty',
    {
      tag: ['@ui', '@regression'],
      annotation: [allure.story('Form validation'), allure.severity(Severity.NORMAL)],
    },
    async ({ navigation }) => {
      const login = await navigation.openLogin();

      await login.submit({ username: '', password: users.standard.password });

      await expect(login.errorMessage(loginErrors.usernameRequired)).toBeVisible();
    },
  );

  test(
    'Check that password error is shown when password is empty',
    {
      tag: ['@ui', '@regression'],
      annotation: [allure.story('Form validation'), allure.severity(Severity.NORMAL)],
    },
    async ({ navigation }) => {
      const login = await navigation.openLogin();

      await login.submit({ username: users.standard.username, password: '' });

      await expect(login.errorMessage(loginErrors.passwordRequired)).toBeVisible();
    },
  );

  test.describe('locked-out account', () => {
    // Evaluated before any device is allocated, so iOS runs skip without touching a simulator.
    test.skip(({ appPlatform }) => appPlatform === 'ios', 'The iOS build of My Demo App has no locked-out account');

    test(
      'Check that locked-out error is shown when locked-out credentials are submitted',
      {
        tag: ['@ui', '@regression'],
        annotation: [allure.story('Locked-out account'), allure.severity(Severity.CRITICAL)],
      },
      async ({ navigation }) => {
        const login = await navigation.openLogin();

        await login.submit(users.lockedOut);

        await expect(login.errorMessage(lockedOutError)).toBeVisible();
      },
    );
  });
});
