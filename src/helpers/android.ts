const RESOURCE_PACKAGE = 'com.saucelabs.mydemoapp.android';

export function androidId(name: string): string {
  return `${RESOURCE_PACKAGE}:id/${name}`;
}
