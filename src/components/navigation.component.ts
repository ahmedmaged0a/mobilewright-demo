import { navigationCopy } from '../data/copy.ts';
import { CartPage } from '../pages/cart.page.ts';
import { CatalogPage } from '../pages/catalog.page.ts';
import { LoginPage } from '../pages/login.page.ts';
import { step } from '../helpers/reporting.ts';
import { BaseComponent } from './base.component.ts';

export class NavigationComponent extends BaseComponent {
  // --- Locators ---

  private readonly cart_btn = this.select({
    android: (screen) => screen.getByLabel(navigationCopy.viewCart),
    ios: (screen) => screen.getByTestId('Cart-tab-item'),
  });

  private readonly menu_btn = this.select({
    android: (screen) => screen.getByLabel(navigationCopy.viewMenu),
    ios: (screen) => screen.getByTestId('More-tab-item'),
  });

  private readonly catalog_btn = this.select({
    android: (screen) => screen.getByText(navigationCopy.catalogMenuItem),
    ios: (screen) => screen.getByTestId('Catalog-tab-item'),
  });

  private readonly login_mnu = this.select({
    android: (screen) => screen.getByLabel(navigationCopy.loginMenuItem),
    ios: (screen) => screen.getByTestId('LogOut-menu-item'),
  });

  // --- Actions ---

  async tapCartBtn(): Promise<void> {
    await this.cart_btn.tap({ timeout: NavigationComponent.screenTimeout });
  }

  async tapMenuBtn(): Promise<void> {
    await this.menu_btn.tap({ timeout: NavigationComponent.screenTimeout });
  }

  async tapCatalogBtn(): Promise<void> {
    await this.catalog_btn.tap({ timeout: NavigationComponent.screenTimeout });
  }

  async tapLoginMnu(): Promise<void> {
    await this.reveal(this.login_mnu);
    await this.login_mnu.tap();
  }

  async openCart(): Promise<CartPage> {
    return step('Open cart', async () => {
      await this.tapCartBtn();
      return new CartPage(this.screen, this.platform).waitUntilLoaded();
    });
  }

  async openCatalog(): Promise<CatalogPage> {
    return step('Open catalog', async () => {
      if (this.platform === 'android') {
        await this.tapMenuBtn();
        await this.tapCatalogBtn();
      } else {
        await this.tapCatalogBtn();
      }
      const catalog = await new CatalogPage(this.screen, this.platform).waitUntilLoaded();
      if (this.platform === 'android') {
        // Recycled lists keep scroll offset after returning from details — reset to the top.
        await this.screen.swipe('down', { duration: 300 });
        await this.screen.swipe('down', { duration: 300 });
        await this.screen.swipe('down', { duration: 300 });
      }
      return catalog;
    });
  }

  async openLogin(): Promise<LoginPage> {
    return step('Open login', async () => {
      await this.tapMenuBtn();
      await this.tapLoginMnu();
      return new LoginPage(this.screen, this.platform).waitUntilLoaded();
    });
  }
}
