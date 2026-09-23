import type { PerPlatform } from '../helpers/platform.ts';

export interface Product {
  /** Platform-neutral name for test titles and report steps. */
  readonly label: string;
  /** Catalog title. The iOS build appends the colour to some names. */
  readonly name: PerPlatform<string>;
  readonly price: number;
}

export const products = {
  /** First item of the catalog on both platforms. */
  backpack: {
    label: 'backpack',
    name: { android: 'Sauce Labs Backpack', ios: 'Sauce Labs Backpack - Black' },
    price: 29.99,
  },
  /** Below the fold on both platforms, so opening it exercises scrolling. */
  bikeLight: {
    label: 'bike light',
    name: { android: 'Sauce Labs Bike Light', ios: 'Sauce Labs Bike Light' },
    price: 9.99,
  },
} as const satisfies Record<string, Product>;
