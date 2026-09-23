import { existsSync } from 'node:fs';
import { test as base, expect } from '@mobilewright/test';
import * as allure from 'allure-js-commons';
import { toArray, type Device } from 'mobilewright';
import { NavigationComponent } from '../components/navigation.component.ts';
import { resolvePlatform, type Platform } from '../helpers/platform.ts';
import { CatalogPage } from '../pages/catalog.page.ts';

type VideoMode = 'off' | 'on' | 'retain-on-failure';

function videoMode(): VideoMode {
  const value = process.env['MW_VIDEO']?.trim() || 'off';
  if (value === 'off' || value === 'on' || value === 'retain-on-failure') {
    return value;
  }
  throw new Error(`MW_VIDEO must be "off", "on" or "retain-on-failure" (got "${value}")`);
}

function foregroundTimeout(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('to be in foreground');
}

async function launchForTest(device: Device, bundleId: string): Promise<void> {
  const once = async (): Promise<void> => {
    await device.terminateApp(bundleId).catch(() => undefined);
    await device.launchApp(bundleId);
  };

  try {
    await once();
  } catch (error) {
    if (!foregroundTimeout(error)) {
      throw error;
    }
    await once();
  }
}

interface AppFixtures {
  appPlatform: Platform;
  navigation: NavigationComponent;
  catalogPage: CatalogPage;
}

interface AutomaticFixtures {
  appArtifactsPresent: void;
  allureContext: void;
  appLaunched: void;
  screenshotAttached: void;
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
      for (const { type, description } of testInfo.annotations) {
        if (type.startsWith('device.') && description) {
          await allure.parameter(type, description, { excluded: true });
        }
      }
    },
    { auto: true },
  ],

  appLaunched: [
    async ({ device, bundleId }, use) => {
      if (bundleId) {
        await launchForTest(device, bundleId);
      }
      await use();
    },
    { auto: true, timeout: 0 },
  ],

  screenshotAttached: [
    async ({ screen }, use, testInfo) => {
      await use();
      const body = await screen.screenshot().catch(() => undefined);
      if (body) {
        await testInfo.attach('screenshot', { body, contentType: 'image/png' });
      }
    },
    { auto: true },
  ],

  appPlatform: async ({ platform }, use) => {
    await use(resolvePlatform(platform));
  },

  navigation: async ({ screen, appPlatform, appLaunched: _appLaunched }, use) => {
    await use(new NavigationComponent(screen, appPlatform));
  },

  catalogPage: async ({ screen, appPlatform, appLaunched: _appLaunched }, use) => {
    await use(await new CatalogPage(screen, appPlatform).waitUntilLoaded());
  },
});

export { expect };
