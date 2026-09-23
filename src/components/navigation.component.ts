import { CartPage } from '../pages/cart.page.ts';
import { CatalogPage } from '../pages/catalog.page.ts';
import { LoginPage } from '../pages/login.page.ts';
import { step } from '../helpers/reporting.ts';
import { BaseComponent } from './base.component.ts';

/** App-wide navigation: a header with a drawer menu on Android, a bottom tab bar on iOS. */
export class NavigationComponent extends BaseComponent {
  private readonly cart_btn = this.select({
    android: (screen) => screen.getByLabel('View cart'),
    ios: (screen) => screen.getByTestId('Cart-tab-item'),
  });

  private readonly menu_btn = this.select({
    android: (screen) => screen.getByLabel('View menu'),
    ios: (screen) => screen.getByTestId('More-tab-item'),
  });

  private readonly login_mnu = this.select({
    android: (screen) => screen.getByLabel('Login Menu Item'),
    // The iOS item keeps its "LogOut" identifier while logged out; its visible label reads "Login".
    ios: (screen) => screen.getByTestId('LogOut-menu-item'),
  });

  // Navigation is usually the first interaction after launch, so it may wait for the first render.
  async tapCartBtn(): Promise<void> {
    await this.cart_btn.tap({ timeout: NavigationComponent.screenTimeout });
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
        await this.menu_btn.tap({ timeout: NavigationComponent.screenTimeout });
        await this.screen.getByText('Catalog').tap();
      } else {
        await this.screen.getByTestId('Catalog-tab-item').tap({ timeout: NavigationComponent.screenTimeout });
      }
      return new CatalogPage(this.screen, this.platform).waitUntilLoaded();
    });
  }

  async openLogin(): Promise<LoginPage> {
    return step('Open login', async () => {
      await this.menu_btn.tap({ timeout: NavigationComponent.screenTimeout });
      await this.login_mnu.scrollIntoViewIfNeeded();
      await this.login_mnu.tap();
      return new LoginPage(this.screen, this.platform).waitUntilLoaded();
    });
  }
}
