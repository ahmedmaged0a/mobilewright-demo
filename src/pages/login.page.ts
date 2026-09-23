import { expect } from '@mobilewright/test';
import type { Locator } from 'mobilewright';
import { loginCopy } from '../data/copy.ts';
import type { Credentials } from '../data/users.ts';
import { androidId } from '../helpers/android.ts';
import { dismissIOSSoftwareKeyboard } from '../helpers/ios-keyboard.ts';
import type { PerPlatform } from '../helpers/platform.ts';
import { step } from '../helpers/reporting.ts';
import { BasePage } from './base.page.ts';
import { CatalogPage } from './catalog.page.ts';

export class LoginPage extends BasePage {
  protected readonly screenName = 'Login';

  // --- Locators ---

  private readonly username_tb = this.select({
    android: (screen) => screen.getByTestId(androidId('nameET')),
    ios: (screen) => screen.getByRole('textfield').first(),
  });

  private readonly password_tb = this.select({
    android: (screen) => screen.getByTestId(androidId('passwordET')),
    ios: (screen) => screen.getByRole('textfield').nth(1),
  });

  private readonly login_btn = this.select({
    android: (screen) => screen.getByTestId(androidId('loginBtn')),
    ios: (screen) => screen.getByRole('button', { name: loginCopy.loginButton }),
  });

  protected readonly loadedIndicator = this.select({
    android: (screen) => screen.getByTestId(androidId('loginBtn')),
    ios: (screen) => screen.getByText(loginCopy.usernamesHeader),
  });

  private error_lbl(message: PerPlatform<string> | string): Locator {
    return this.screen.getByText(typeof message === 'string' ? message : this.pick(message));
  }

  private sampleUser_btn(name: string): Locator {
    return this.screen.getByRole('button', { name });
  }

  // --- Assertions ---

  override async waitUntilLoaded(): Promise<this> {
    await step(`Wait for ${this.screenName} screen`, () => this.reveal(this.loadedIndicator));
    return this;
  }

  async expectErrorVisible(message: PerPlatform<string> | string): Promise<void> {
    const text = typeof message === 'string' ? message : this.pick(message);
    await step(`Expect login error "${text}"`, () => expect(this.error_lbl(message)).toBeVisible());
  }

  // --- Actions ---

  async typeUsernameTB(value: string): Promise<void> {
    await this.username_tb.fill(value);
  }

  async typePasswordTB(value: string): Promise<void> {
    await this.password_tb.fill(value);
  }

  async tapLoginBtn(): Promise<void> {
    await this.reveal(this.login_btn);
    if (this.platform === 'ios') {
      await dismissIOSSoftwareKeyboard();
    }
    await this.login_btn.tap();
  }

  async submit({ username, password }: Credentials): Promise<void> {
    const name = this.resolveUsername(username);
    await step(`Submit login form as "${name || '(no username)'}"`, async () => {
      if (this.platform === 'ios' && name && password) {
        const sampleUser = this.sampleUser_btn(name);
        if (await sampleUser.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await sampleUser.tap();
          await this.tapLoginBtn();
          return;
        }
      }

      if (name) {
        await this.typeUsernameTB(name);
      }
      if (password) {
        await this.typePasswordTB(password);
      }
      await this.tapLoginBtn();
    });
  }

  async loginAs(user: Credentials): Promise<CatalogPage> {
    await this.submit(user);
    return new CatalogPage(this.screen, this.platform).waitUntilLoaded();
  }

  private resolveUsername(username: Credentials['username']): string {
    return typeof username === 'string' ? username : this.pick(username);
  }
}
