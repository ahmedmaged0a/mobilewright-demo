import { existsSync } from 'node:fs';
import { test as base, expect } from '@mobilewright/test';
import * as allure from 'allure-js-commons';
import { toArray } from 'mobilewright';
import { NavigationComponent } from '../components/navigation.component.ts';
import { resolvePlatform, type Platform } from '../helpers/platform.ts';
import { CatalogPage } from '../pages/catalog.page.ts';

type VideoMode = 'off' | 'on' | 'retain-on-failure';

/** `MW_VIDEO` opts into MobileWright's screen recording, which is off by default because it slows devices down. */
function videoMode(): VideoMode {
  const value = process.env['MW_VIDEO']?.trim() || 'off';
  if (value === 'off' || value === 'on' || value === 'retain-on-failure') {
    return value;
  }
  throw new Error(`MW_VIDEO must be "off", "on" or "retain-on-failure" (got "${value}")`);
}

interface AppFixtures {
  /** Platform of the running project, validated. */
  appPlatform: Platform;
  navigation: NavigationComponent;
  /** The app's launch screen, already displayed. */
  catalogPage: CatalogPage;
}

interface AutomaticFixtures {
  appArtifactsPresent: void;
  allureContext: void;
}

export const test = base.extend<AppFixtures & AutomaticFixtures>({
  video: [videoMode(), { scope: 'worker' }],

  appArtifactsPresent: [
    async ({ installApps }, use) => {
      const missing = toArray(installApps).filter((path) => !existsSync(path));
      if (missing.length > 0) {
        throw new Error(
          `App build not found: ${missing.join(', ')}. Run "npm run apps:fetch", point IOS_APP_PATH / ` +
            'ANDROID_APP_PATH at your own build, or set SKIP_APP_INSTALL=1 if the app is already installed.',
        );
      }
      await use();
    },
    { auto: true },
  ],

  allureContext: [
    async ({ platform }, use, testInfo) => {
      await allure.label('platform', resolvePlatform(platform));
      await use();
      // MobileWright records the allocated device as `device.*` annotations during setup.
      for (const { type, description } of testInfo.annotations) {
        if (type.startsWith('device.') && description) {
          await allure.parameter(type, description, { excluded: true });
        }
      }
    },
    { auto: true },
  ],

  appPlatform: async ({ platform }, use) => {
    await use(resolvePlatform(platform));
  },

  navigation: async ({ screen, appPlatform }, use) => {
    await use(new NavigationComponent(screen, appPlatform));
  },

  catalogPage: async ({ screen, appPlatform }, use) => {
    await use(await new CatalogPage(screen, appPlatform).waitUntilLoaded());
  },
});

export { expect };
