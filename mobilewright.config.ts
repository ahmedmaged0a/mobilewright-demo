import { existsSync } from 'node:fs';
import os from 'node:os';
import { resolve } from 'node:path';
import { defineConfig, type MobilewrightUseOptions } from 'mobilewright';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

type Platform = 'ios' | 'android';
type DeviceType = NonNullable<MobilewrightUseOptions['deviceType']>;

const demoApp = {
  android: {
    version: '2.2.0',
    bundleId: 'com.saucelabs.mydemoapp.android',
    artifact: 'apps/android/my-demo-app.apk',
  },
  ios: {
    version: '2.2.2',
    bundleId: 'com.saucelabs.mydemo.app.ios',
    artifact: 'apps/ios/my-demo-app-simulator.zip',
  },
} as const satisfies Record<Platform, { version: string; bundleId: string; artifact: string }>;

function readEnv(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function readDeviceType(name: string): DeviceType | undefined {
  const value = readEnv(name);
  if (value === undefined || value === 'simulator' || value === 'emulator' || value === 'real') {
    return value;
  }
  throw new Error(`${name} must be "simulator", "emulator" or "real" (got "${value}")`);
}

const isCI = Boolean(readEnv('CI'));
const skipAppInstall = ['1', 'true'].includes(readEnv('SKIP_APP_INSTALL') ?? '');

function projectUse(platform: Platform): MobilewrightUseOptions {
  const prefix = platform.toUpperCase();
  const appPath = readEnv(`${prefix}_APP_PATH`) ?? demoApp[platform].artifact;
  const deviceName = readEnv(`${prefix}_DEVICE_NAME`);
  const deviceType = readDeviceType(`${prefix}_DEVICE_TYPE`) ?? (platform === 'ios' ? 'simulator' : undefined);
  return {
    platform,
    bundleId: demoApp[platform].bundleId,
    ...(deviceName && { deviceName: new RegExp(deviceName) }),
    ...(deviceType && { deviceType }),
    ...(!skipAppInstall && { installApps: resolve(appPath) }),
  };
}

function allureEnvironmentInfo(): Record<string, string> {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SHA } = process.env;
  return {
    'Host OS': `${os.type()} ${os.release()} (${os.arch()})`,
    'Node.js': process.version,
    'Android app': `${demoApp.android.bundleId} ${demoApp.android.version}`,
    'iOS app': `${demoApp.ios.bundleId} ${demoApp.ios.version}`,
    ...(GITHUB_RUN_ID && { 'CI run': `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}` }),
    ...(GITHUB_SHA && { Commit: GITHUB_SHA }),
  };
}

export default defineConfig({
  autoAppLaunch: false,
  testDir: './tests',
  outputDir: './test-results',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  retries: isCI ? 1 : 0,
  fullyParallel: true,
  forbidOnly: isCI,
  viewTree: 'on-failure',
  globalSetup: './src/setup/global-setup.ts',
  use: {
    actionTimeout: 10_000,
    appLaunchTimeout: 60_000,
    installTimeout: 180_000,
    animations: 'off',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'mobilewright-report', open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: false,
        suiteTitle: true,
        environmentInfo: allureEnvironmentInfo(),
      },
    ],
    ['./src/setup/allure-html-reporter.ts'],
  ],
  projects: [
    { name: 'ios', use: projectUse('ios') },
    { name: 'android', use: projectUse('android') },
  ],
});
