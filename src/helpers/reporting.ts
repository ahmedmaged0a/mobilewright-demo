import { test } from '@mobilewright/test';
import { Severity } from 'allure-js-commons';
import type { Screen } from 'mobilewright';

export { Severity };

export function step<T>(title: string, body: () => Promise<T>): Promise<T> {
  return test.step(title, body, { box: true });
}

export async function attachScreenshot(screen: Screen, name: string): Promise<void> {
  await test.info().attach(name, { body: await screen.screenshot(), contentType: 'image/png' });
}

interface TestAnnotation {
  readonly type: string;
  readonly description: string;
}

function allureLabel(name: string, value: string): TestAnnotation {
  return { type: `@allure.label.${name}`, description: value };
}

export const allure = {
  epic: (name: string) => allureLabel('epic', name),
  feature: (name: string) => allureLabel('feature', name),
  story: (name: string) => allureLabel('story', name),
  severity: (level: Severity) => allureLabel('severity', level),
  owner: (name: string) => allureLabel('owner', name),
} as const;
