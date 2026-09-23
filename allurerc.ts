import { defineConfig } from 'allure';

function isPlatform(platform: string) {
  return ({ labels }: { labels: { name: string; value?: string }[] }) =>
    labels.some(({ name, value }) => name === 'platform' && value === platform);
}

export default defineConfig({
  name: 'My Demo App · MobileWright',
  resultsDir: './allure-results',
  output: './allure-report',
  environments: {
    ios: { name: 'iOS', matcher: isPlatform('ios') },
    android: { name: 'Android', matcher: isPlatform('android') },
  },
});
