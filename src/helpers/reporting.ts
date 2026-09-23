import { test } from '@mobilewright/test';
import { Severity } from 'allure-js-commons';
import type { Screen } from 'mobilewright';

export { Severity };

/**
 * Runs `body` as a named report step. The step shows up in the MobileWright HTML report and in
 * Allure (allure-playwright maps Playwright steps to Allure steps). `box` makes a failure point at
 * the calling page method instead of MobileWright internals.
 */
export function step<T>(title: string, body: () => Promise<T>): Promise<T> {
  return test.step(title, body, { box: true });
}

/** Attaches the current device screen to the running test, e.g. as evidence of a checkpoint. */
export async function attachScreenshot(screen: Screen, name: string): Promise<void> {
  await test.info().attach(name, { body: await screen.screenshot(), contentType: 'image/png' });
}

interface TestAnnotation {
  readonly type: string;
  readonly description: string;
}

/** allure-playwright turns `@allure.label.<name>` annotations into Allure labels. */
function allureLabel(name: string, value: string): TestAnnotation {
  return { type: `@allure.label.${name}`, description: value };
}

/**
 * Declarative Allure metadata for `test()` / `test.describe()` details, e.g.
 * `test('adds to cart', { annotation: [allure.story('Add to cart'), allure.severity(Severity.CRITICAL)] }, ...)`.
 */
export const allure = {
  epic: (name: string) => allureLabel('epic', name),
  feature: (name: string) => allureLabel('feature', name),
  story: (name: string) => allureLabel('story', name),
  severity: (level: Severity) => allureLabel('severity', level),
  owner: (name: string) => allureLabel('owner', name),
} as const;
