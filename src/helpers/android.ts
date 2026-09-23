/**
 * Package that prefixes the Android app's view resource ids. It matches the application id today,
 * but is a separate concept: build flavours with an `applicationIdSuffix` keep the base package here.
 */
const RESOURCE_PACKAGE = 'com.saucelabs.mydemoapp.android';

/** On Android `getByTestId` matches the full resource id, `<package>:id/<name>`. */
export function androidId(name: string): string {
  return `${RESOURCE_PACKAGE}:id/${name}`;
}
