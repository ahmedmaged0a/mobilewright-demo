import type { PerPlatform } from '../helpers/platform.ts';

export interface Product {
  readonly label: string;
  readonly name: PerPlatform<string>;
  readonly price: PerPlatform<number>;
}

export const products = {
  backpack: {
    label: 'backpack',
    name: { android: 'Sauce Labs Backpack', ios: 'Sauce Labs Backpack - Black' },
    price: { android: 29.99, ios: 29.99 },
  },
  companion: {
    label: 'companion product',
    name: { android: 'Sauce Labs Backpack (orange)', ios: 'Sauce Labs Backpack - Green' },
    price: { android: 29.99, ios: 29.99 },
  },
} as const satisfies Record<string, Product>;

export function totalOf(items: readonly Product[]): PerPlatform<number> {
  return {
    android: items.reduce((sum, item) => sum + item.price.android, 0),
    ios: items.reduce((sum, item) => sum + item.price.ios, 0),
  };
}
