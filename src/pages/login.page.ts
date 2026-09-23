import { expect } from '@mobilewright/test';
import type { Locator } from 'mobilewright';
import type { Credentials } from '../data/users.ts';
import { androidId } from '../helpers/android.ts';
import { dismissIOSSoftwareKeyboard } from '../helpers/ios-keyboard.ts';
import type { PerPlatform } from '../helpers/platform.ts';
import { step } from '../helpers/reporting.ts';
import { BasePage } from './base.page.ts';
import { CatalogPage } from './catalog.page.ts';

export class LoginPage extends BasePage {
  protected readonly screenName = 'Login';

  private readonly submit_btn = this.select({
    android: (screen) => screen.getByTestId(androidId('loginBtn')),
    ios: (screen) => screen.getByRole('button', { name: 'Login' }),
  });

  protected readonly loadedIndicator = this.select({
    android: (screen) => screen.getByTestId(androidId('loginBtn')),
    ios: (screen) => screen.getByText('Usernames'),
  });

  private readonly username_tb = this.select({
    android: (screen) => screen.getByTestId(androidId('nameET')),
    ios: (screen) => screen.getByRole('textfield').first(),
  });

  private readonly password_tb = this.select({
    android: (screen) => screen.getByTestId(androidId('passwordET')),
    ios: (screen) => screen.getByRole('textfield').nth(1),
  });

  private errorMessage(message: PerPlatform<string> | string): Locator {
    return this.screen.getByText(typeof message === 'string' ? message : this.pick(message));
  }

  override async waitUntilLoaded(): Promise<this> {
    await step(`Wait for ${this.screenName} screen`, () => this.reveal(this.loadedIndicator));
    return this;
  }

  async expectErrorVisible(message: PerPlatform<string> | string): Promise<void> {
    const text = typeof message === 'string' ? message : this.pick(message);
    await step(`Expect login error "${text}"`, () => expect(this.errorMessage(message)).toBeVisible());
  }

  async submit({ username, password }: Credentials): Promise<void> {
    await step(`Submit login form as "${username || '(no username)'}"`, async () => {
      if (username) {
        await this.typeUsernameTB(username);
      }
      if (password) {
        await this.typePasswordTB(password);
      }
      await this.tapSubmitBtn();
    });
  }

  async typeUsernameTB(value: string): Promise<void> {
    await this.username_tb.fill(value);
  }

  async typePasswordTB(value: string): Promise<void> {
    await this.password_tb.fill(value);
  }

  async tapSubmitBtn(): Promise<void> {
    await this.reveal(this.submit_btn);
    if (this.platform === 'ios') {
      await dismissIOSSoftwareKeyboard();
    }
    await this.submit_btn.tap();
  }

  async loginAs(user: Credentials): Promise<CatalogPage> {
    await this.submit(user);
    return new CatalogPage(this.screen, this.platform).waitUntilLoaded();
  }
}
