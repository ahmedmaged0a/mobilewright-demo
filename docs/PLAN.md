# MobileWright cross-platform framework: plan and architecture

This document is the design record for this repository. It was written before
implementation and is kept up to date as the source of truth for *why* the
framework is shaped the way it is. The [README](../README.md) covers *how* to
use it.

## 1. Goals

- One TypeScript code base that drives the **same user journeys on iOS and
  Android** through MobileWright `projects` in a single config.
- A **Page Object Model** that hides per-platform locator differences behind a
  single, intention-revealing API, so specs stay thin and shared.
- **Allure** reporting with business-readable steps and failure evidence
  (screenshot, accessibility tree, optional video).
- **GitHub Actions** on a self-hosted Mac (local simulators/emulators) and on
  GitHub-hosted runners.
- Default execution target is a local simulator/emulator. Paid device clouds
  are optional and never required.

Out of scope: secrets in git, paid cloud devices as the default path, building
the demo apps from source.

## 2. Verified toolchain

Every package and API below was checked against the npm registry, the
installed type definitions, and <https://mobilewright.dev/docs> on
2026-09-23. Versions are pinned exactly because MobileWright is still `0.0.x`
and ships breaking changes between patch releases (see its changelog).

| Package | Version | Role |
| --- | --- | --- |
| `mobilewright` | 0.0.60 | CLI (`mobilewright test`, `doctor`, `inspect`, `show-report`, `merge-reports`), `defineConfig` |
| `@mobilewright/test` | 0.0.60 | `test` / `expect` with `screen` and `device` fixtures. Built on `@playwright/test` 1.63.0 |
| `allure-playwright` | 3.12.2 | Allure reporter + runtime for the Playwright runner (peer: `@playwright/test >=1.62`) |
| `allure-js-commons` | 3.12.2 | Allure runtime API (`epic`, `feature`, `severity`, `label`, `step`, ...) |
| `allure` | 3.18.0 | Allure 3 CLI (Node based, no Java): `allure generate`, `allure open` |
| `typescript` | 7.0.2 | Type checking only (`tsc --noEmit`); the runner transpiles tests itself |

Facts from the MobileWright sources that shape the design:

- `mobilewright test` loads the config with Playwright's own config loader and
  runs Playwright's test runner. `defineConfig` passes `reporter` through
  untouched (it only prepends its device-pool `globalSetup`). The config type
  accepts `Array<[string] | [string, unknown]>`, so third-party Playwright
  reporters such as `allure-playwright` plug in natively.
- `--reporter` on the command line **replaces** the configured reporters, so
  the npm scripts never pass it.
- The `device` fixture is test-scoped. `autoAppLaunch` is off; the
  `appLaunched` fixture terminates and relaunches the app before every test,
  and retries once if iOS foreground detection times out. Both demo apps keep
  cart and login state in memory, which gives test isolation for free.
- Every locator action (`tap`, `fill`, ...) is already reported as a
  Playwright step, and the `screen` fixture attaches `screenshot-on-failure`
  (and `view-tree-on-failure` when `viewTree: 'on-failure'`). Allure picks all
  of these up without extra code.
- `installApps` paths must be ZIP archives (APK, IPA, or a zipped `.app`).
  mobilecli's simulator installer only looks for a `.app` **at the root** of
  the ZIP.
- `getByTestId` matches the iOS `accessibilityIdentifier` or the full Android
  `resource-id` (`<package>:id/<name>`), compared exactly.
- MobileWright never boots a simulator or emulator; one must already be
  running.

## 3. Demo application

**Sauce Labs My Demo App**, native editions:

| | Android | iOS |
| --- | --- | --- |
| Repository | [saucelabs/my-demo-app-android](https://github.com/saucelabs/my-demo-app-android) | [saucelabs/my-demo-app-ios](https://github.com/saucelabs/my-demo-app-ios) |
| Release used | `2.2.0` | `2.2.2` |
| Artifact | `mda-2.2.0-25.apk` | `SauceLabs-Demo-App.Simulator.zip` (simulator), `SauceLabs-Demo-App.ipa` (real device) |
| Bundle / package ID | `com.saucelabs.mydemoapp.android` | `com.saucelabs.mydemo.app.ios` |
| Minimum OS | Android 5.0 (API 21) | iOS 16.6 |

Why not the React Native edition (`my-demo-app-rn`)? It would allow one set of
accessibility labels, but the repository was archived in 2024 and its last
build dates from 2022. The native apps are maintained, and their differences
are exactly what a cross-platform POM has to absorb in real projects.

The simulator build ships as `Payload/My Demo App.app`. Because mobilecli
expects the `.app` at the ZIP root, `scripts/fetch-apps.sh` downloads the
release assets and repackages the iOS ZIP into `apps/ios/`. Downloads are not
committed (`apps/` is git-ignored).

Screen-level locator sources:

- Android: resource IDs and content descriptions from the app's layout XML
  (`fragment_*.xml`, `menu_header_layout.xml`, `item_*.xml`).
- iOS: accessibility identifiers from the storyboards and the upstream
  XCUITest page object (`MyDemoAppUITests/PageObjects/PageObject.swift`).

Behavioural differences the pages must hide:

| Concern | Android | iOS |
| --- | --- | --- |
| Navigation | Header with drawer menu and cart icon | Bottom tab bar (Catalog, Cart, More) |
| Product names | `Sauce Labs Backpack` | `Sauce Labs Backpack - Black` |
| Login entry | Drawer, `Log In` item | More tab, `LogOut-menu-item` button (labelled "Login") |
| Validation errors | Inline text under the field | Alert dialog |
| Locked-out user | `alice@example.com` is rejected | Not implemented by the app |

Shared by both: product prices render as `$ 29.99`, the cart header renders
`N Items`, the empty cart shows `No Items`, and `bod@example.com` /
`10203040` is a valid login.

## 4. Architecture

```
tests/            thin, platform-agnostic specs
  ↓ uses
src/fixtures/     test.extend(): injects page objects + Allure metadata
  ↓ constructs
src/pages/        one class per screen, extends BasePage
src/components/   UI shared by several screens (navigation)
  ↓ resolves locators through
src/helpers/      platform selection, Allure step/attachment helpers, parsing
src/data/         typed test data (products, users) with per-platform values
  ↓
@mobilewright/test  screen / device fixtures → mobilecli → device
```

### Directory layout

```
src/
  components/navigation.component.ts
  data/products.ts, users.ts
  fixtures/index.ts
  helpers/platform.ts, reporting.ts, text.ts
  pages/base.page.ts, catalog.page.ts, product-details.page.ts,
        cart.page.ts, login.page.ts
tests/
  catalog.spec.ts, cart.spec.ts, login.spec.ts
scripts/
  fetch-apps.sh, boot-ios-simulator.sh, boot-android-emulator.sh
mobilewright.config.ts
allurerc.mjs
.github/workflows/
  e2e-self-hosted.yml, e2e-github-hosted.yml
```

### Platform-aware locators

A page declares its locators once per platform and selects them at
construction time:

```ts
protected readonly addToCartButton = this.select({
  android: (s) => s.getByTestId(androidId('cartBt')),
  ios: (s) => s.getByTestId('AddToCart'),
});
```

`select()` lives in `BasePage` and returns a plain MobileWright `Locator`, so
page methods and assertions never branch on the platform. Branching is
confined to the rare behaviour that genuinely differs (for example how
navigation to the login screen works), and is expressed with the same helper.

Locator priority follows the MobileWright inspector:
`getByTestId` > `getByRole` > `getByLabel` > `getByText`.

### Pages and components

- `BasePage` holds `screen` and `platform`, the `select()` helper, and a
  `waitUntilLoaded()` contract backed by each page's `loadedIndicator`.
- Page methods are business actions (`addToCart()`, `loginAs(user)`) wrapped
  in Allure steps. Navigation methods return the next page object so specs
  can chain journeys.
- Each page owns its locators, constructor wiring, action methods, and
  assertion methods. Assertion methods call MobileWright's auto-waiting
  `expect`. Specs call those methods (`expectProductVisible`,
  `expectErrorVisible`, `expectEmpty`, `expectTotalCloseTo`, …) and do not
  assert on locators themselves.
- `NavigationComponent` hides header/drawer versus tab-bar navigation.

### Fixtures

`src/fixtures/index.ts` extends `@mobilewright/test`:

- Page fixtures (`catalogPage`, `productDetailsPage`, `cartPage`,
  `loginPage`, `navigation`) are built from `screen` and the project's
  `platform` option.
- An automatic `allureContext` fixture tags every test with `platform`,
  `device.*`, and host labels so results can be split by platform.

### Test data

`src/data` holds typed, immutable data. Values that differ per platform use a
`PerPlatform<T>` record and are resolved through the same `platform` value the
pages use. Credentials are the public demo accounts printed on the app's own
login screen; nothing secret is stored.

## 5. Allure strategy

| Need | Mechanism |
| --- | --- |
| Reporter | `['allure-playwright', { resultsDir: 'allure-results', ... }]` in `mobilewright.config.ts`, next to `list` and `html` |
| Business steps | `step()` helper around `test.step(..., { box: true })`. Rendered by both the MobileWright HTML report and Allure |
| Low-level steps | Automatic: MobileWright reports every locator action as a nested step |
| Failure evidence | Automatic: `screenshot-on-failure` (MobileWright), `view-tree-on-failure` via `viewTree: 'on-failure'` |
| Checkpoint evidence | `attachScreenshot(screen, name)` helper for key states (e.g. filled cart) |
| Video | Opt-in with `MW_VIDEO=retain-on-failure` (MobileWright records through mobilecli) |
| Metadata | `allure-js-commons`: `epic`, `feature`, `story`, `severity`, `owner`, `tags`; `platform` label from the fixture |
| Environment | `environmentInfo` in reporter options (OS, Node, MobileWright version, CI run URL) |
| Report | Allure 3 CLI. `allurerc.ts` defines report name, output folder, one Allure *environment* per platform, and Awesome `singleFile`. `scripts/allure-generate.mjs` then keeps only `allure-report/index.html`, a standalone file that opens via `file://` |

A finished `mobilewright test` (pass or fail) writes that file. `npm run test:list` does not. `npm run allure:generate` rebuilds it on demand, and `npm run allure:open` serves it. CI still runs `npm run allure:generate` after merging the iOS and Android `allure-results` artifacts, and uploads `allure-report/index.html`. Platform jobs may also produce a local copy; they upload `allure-results/`, not that HTML.

The hook is a reporter `onExit` (`src/setup/allure-html-reporter.ts`), not `globalTeardown`. Playwright runs `globalTeardown` before reporters' `onEnd`, which is when `allure-playwright` writes environment info, categories, and not-started skipped tests. The IDE test server also runs `globalTeardown` only when the server stops, not after each run. `onExit` runs after that flush for `npx mobilewright test`, `npm run test:*`, and a long-lived runner, and it calls the same `npm run allure:generate` command. It skips `--list` (Playwright still loads reporters, and a list pass would otherwise rebuild from tests that did not run). It also skips the build when the Allure reporter is absent or `allure-results` has no `*-result.json`, so an empty run does not delete a previous `index.html`.

## 6. CI design

Both workflows follow the MobileWright CI guide
(<https://mobilewright.dev/docs/getting-started/ci>): `npm ci`, run
`mobilewright test`, upload reports with `if: ${{ !cancelled() }}`. Triggers:
`push` and `pull_request` to `main`, plus `workflow_dispatch`.

### `e2e-self-hosted.yml`: `runs-on: [self-hosted, macOS]`

- Matrix `project: [ios, android]`, `max-parallel: 1` by default because one
  Mac usually hosts both devices; each leg reuses devices that are already
  running and only boots them if needed.
- Runner prerequisites (documented in the README): Xcode + command line tools,
  a JDK with `JAVA_HOME`, Android SDK with `ANDROID_HOME`, `adb` and
  `emulator` on `PATH`, Node 22.12+, and an AVD.
- `npx mobilewright doctor --category <platform>` runs first for fast,
  readable diagnostics.

### `e2e-github-hosted.yml`

| Job | Runner | Device |
| --- | --- | --- |
| `ios` | `macos-latest` | iOS Simulator booted with `xcrun simctl` (`scripts/boot-ios-simulator.sh`) |
| `android` | `ubuntu-latest` | Android emulator via `reactivecircus/android-emulator-runner` with KVM enabled |
| `allure-report` | `ubuntu-latest` | Downloads both `allure-results-*` artifacts, generates one Allure report |

`ubuntu-latest` is used for Android because it offers hardware-accelerated
emulators (KVM) and is cheaper than macOS minutes; mobilecli ships a
`linux-amd64` binary. The Android job runs the MobileWright CLI directly on the
runner. The Docker image (`ghcr.io/mobile-next/mobilewright`) is documented as
an alternative for Linux workstations.

Toolchain versions (Node 22, Java 17 Temurin, Android API 34 `google_apis`
x86_64 image, Xcode from the runner image) are set once via workflow `env`.

## 7. Conventions

- TypeScript `strict`, plus `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`,
  `noUnusedLocals` / `noUnusedParameters`. `npm run typecheck` gates CI.
- File names are kebab-case with a role suffix (`*.page.ts`,
  `*.component.ts`, `*.spec.ts`).
- No sleeps: rely on auto-waiting locators and assertions.
- Specs never touch raw locators, `expect(...)`, or `platform`, except for
  explicitly platform-scoped cases which use `test.skip(platform === ..., reason)`.
  UI checks go through page assertion methods.
- Each test is independent (fresh app process), so `fullyParallel` is safe
  when more than one device is available.

## 8. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| MobileWright is pre-1.0 | Exact version pins; upgrade deliberately with the changelog |
| Locators drift when the demo app updates | App versions pinned in `fetch-apps.sh`; locators isolated in page classes |
| iOS dump omits unlabeled containers | Only identifiers and labelled elements are targeted (see the locators guide) |
| Slow emulators on shared CI | Generous `appLaunchTimeout`/`installTimeout`, 1 retry on CI, animations off |
| Sauce Labs Bike Light | Not used. Android 2.2.0 never reaches a stable product-details screen for it (session drop or a 30s visibility timeout). iOS sorts it below the fold, where `scrollIntoViewIfNeeded` fails its full-viewport check. The companion product is the onesie on Android (catalog index with a real meta value; fleece jacket crashes Android 2.2.0) and the green backpack on iOS (same row as the black backpack) |
| iOS login button id | The 2.2.2 storyboard gives the submit button the title `Login` and no `accessibilityIdentifier`. The screen is detected by the `Usernames` label; the button is `getByRole('button', { name: 'Login' }). CI boots the simulator with the hardware keyboard connected, and the login page toggles the software keyboard away before tapping Login so the tap is not swallowed |
| iOS DeviceKit launch race | `autoAppLaunch` is off. The `appLaunched` fixture terminates and launches the app, and retries once when foreground detection times out |
| Parallel jobs fighting over one Mac's devices | Self-hosted matrix runs legs sequentially by default |

## 9. Delivery checklist

1. Plan (this document).
2. Tooling: `package.json`, `tsconfig.json`, `.gitignore`, config, app fetch
   script.
3. POM: helpers, data, base page, pages, component, fixtures.
4. Specs: catalog, cart, login.
5. Allure: reporter, helpers, `allurerc.mjs`, scripts.
6. CI: self-hosted and GitHub-hosted workflows.
7. README: prerequisites, `doctor`, app install, local runs, self-hosted
   runner setup, CI and reporting.
8. Verification: `npm run typecheck`, `mobilewright test --list`, and a real
   Android run where an emulator is available.
