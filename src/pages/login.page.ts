import type { Locator } from 'mobilewright';
import type { Credentials } from '../data/users.ts';
import { androidId } from '../helpers/android.ts';
import type { PerPlatform } from '../helpers/platform.ts';
import { step } from '../helpers/reporting.ts';
import { BasePage } from './base.page.ts';
import { CatalogPage } from './catalog.page.ts';

export class LoginPage extends BasePage {
  protected readonly screenName = 'Login';

  private readonly submit_btn = this.select({
    android: (screen) => screen.getByTestId(androidId('loginBtn')),
    ios: (screen) => screen.getByTestId('Login Button'),
  });

  protected readonly loadedIndicator = this.submit_btn;

  // The iOS text fields carry no identifier or placeholder, so they are addressed by position.
  private readonly username_tb = this.select({
    android: (screen) => screen.getByTestId(androidId('nameET')),
    ios: (screen) => screen.getByRole('textfield').first(),
  });

  private readonly password_tb = this.select({
    android: (screen) => screen.getByTestId(androidId('passwordET')),
    ios: (screen) => screen.getByRole('textfield').nth(1),
  });

  /** Android shows validation errors inline, iOS in an alert; both render the message as text. */
  errorMessage(message: PerPlatform<string> | string): Locator {
    return this.screen.getByText(typeof message === 'string' ? message : this.pick(message));
  }

  /** Fills the non-empty fields and submits, without expecting any particular outcome. */
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
    await this.submit_btn.tap();
  }

  async loginAs(user: Credentials): Promise<CatalogPage> {
    await this.submit(user);
    return new CatalogPage(this.screen, this.platform).waitUntilLoaded();
  }
}
