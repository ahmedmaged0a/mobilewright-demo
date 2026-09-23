# mobilewright-framework

*- This project is the test automation framework for Sauce Labs My Demo App using the MobileWright test automation tool and the TypeScript programming language.*

*- This project is based on MobileWright official documentation and you can find more details on the website:*
https://mobilewright.dev/docs/

*- Design rationale and architecture decisions live in [`docs/PLAN.md`](docs/PLAN.md).*

## `Preparation:`

### A. Pre-requirements:

#### 1- Download and install Node.js 22.12 or newer through the below link
https://nodejs.org/en/download

This repository pins Node via [`.nvmrc`](.nvmrc). With nvm:

        nvm install
        nvm use

#### 2- Download and install Visual Studio Code through the below link
https://code.visualstudio.com/download

#### 3- Install VS Code extensions
* ESLint
* (Optional) Playwright Test for VSCode — MobileWright reuses the Playwright test runner UI patterns

#### 4- Platform toolchains (required before the first run)

MobileWright drives real simulators, emulators, and devices. It does **not** boot a device for you.

* **Everywhere:** a booted simulator/emulator or a USB-connected device
* **iOS (macOS):** Xcode + Command Line Tools
* **Android:** JDK 11+, Android SDK with `ANDROID_HOME` set and `adb` on `PATH`

Verify the host before installing apps or running tests:

        npx mobilewright doctor

### B. Project readiness

#### 1- Clone the project

        git clone https://github.com/ahmedmaged0a/mobilewright-demo.git
        cd mobilewright-demo

#### 2- Run the below command to install the required dependencies

        npm install

#### 3- Fetch the demo app builds (git-ignored under `apps/`)

        npm run apps:fetch

#### 4- Copy environment sample and adjust for your machine

        cp .env.example .env

#### 5- Boot a device **before** running tests (MobileWright never boots one for you)

        # iOS — boot simulator + install mobilecli agent, then run
        bash scripts/boot-ios-simulator.sh
        npx mobilewright test --project=ios

        # Android — boot emulator, then run
        bash scripts/boot-android-emulator.sh
        npx mobilewright test --project=android

## `How to run?`

### A. Running normal test cases:

Official CLI commands from [Mobilewright docs](https://mobilewright.dev/docs/):

#### 1- Run all projects:

        npx mobilewright test

#### 2- Run a single platform:

        npx mobilewright test --project=android
        npx mobilewright test --project=ios

#### 3- Show the MobileWright HTML report:

        npx mobilewright show-report

#### 4- Device / app overrides via environment (see `.env.example`):

        ANDROID_DEVICE_NAME='Pixel 8' npx mobilewright test --project=android
        IOS_DEVICE_NAME='iPhone 16' npx mobilewright test --project=ios
        SKIP_APP_INSTALL=1 npx mobilewright test --project=android

        # Supported project names: ios | android
        # App paths default to apps/android/my-demo-app.apk and apps/ios/my-demo-app-simulator.zip
        # Override with ANDROID_APP_PATH / IOS_APP_PATH when using your own build

### B. Running test cases using a pre-defined script in package.json:

        npm run {predefined command}

Official Mobilewright CLI (see https://mobilewright.dev/):

| Command | Purpose |
| --- | --- |
| `npx mobilewright doctor` | Verify Node, mobilecli, Xcode/Android SDK |
| `npx mobilewright devices` | List attached / booted devices |
| `npx mobilewright test` | Run all projects |
| `npx mobilewright test --project=android` / `--project=ios` | Single platform |
| `npx mobilewright test --grep @sanity` | Filter by tag (`@ui`, `@smoke`, `@regression`, `@e2e`, …) |
| `npx mobilewright test tests/login.spec.ts` | Single feature spec |
| `npx mobilewright test --list` | List tests without executing |
| `npx mobilewright show-report` | Open MobileWright HTML report |

Project convenience scripts (same as above, plus extras):

| Script | Purpose |
| --- | --- |
| `npm run doctor` | → `mobilewright doctor` |
| `npm run devices` | → `mobilewright devices` |
| `npm run apps:fetch` | Download My Demo App APK + iOS simulator zip |
| `npm run test` | → `mobilewright test` |
| `npm run test:android` / `test:ios` | → `mobilewright test --project=…` |
| `npm run test:ui` / `test:sanity` / `test:smoke` / `test:regression` / `test:e2e` | Tag filters for business groups |
| `npm run test:login` / `test:catalog` / `test:cart` | Feature specs under `tests/` |
| `npm run test:list` | → `mobilewright test --list` |
| `npm run typecheck` | TypeScript static check |
| `npm run lint` | ESLint static analysis |
| `npm run report:html` | → `mobilewright show-report` |
| `npm run allure:generate` / `allure:open` | Rebuild or open the standalone Allure HTML. A finished test run writes it too |

### C. Generating / Opening Allure report:

`npx mobilewright test` and the `npm run test` scripts that execute tests write `allure-report/index.html` when the run finishes, including when tests fail. That folder contains only this file, and it opens via `file://`. `npm run test:list` does not build a report.

#### 1- Generate the report manually (same command CI uses after merging results):

        npm run allure:generate

#### 2- Open the report:

        npm run allure:open

Or open `allure-report/index.html` in a browser.

### D. Using ESLint to make static analysis:

#### 1- Run ESLint command:

        npm run lint

## `Features:`

### A. Usage of MobileWright advantages:

#### 1- Waits and timeout adjustment
* Total / per-test timeout
* Action timeout
* Expect timeout
* App launch and install timeouts

#### 2- Screenshots, video recording and view-tree preparation
* Screenshot on failure (built-in)
* Accessibility view tree on failure (`viewTree: 'on-failure'`)
* Optional video via `MW_VIDEO=on` or `retain-on-failure`

#### 3- Different types of report configurations
* list - html - Allure (via `allure-playwright`)

#### 4- Parallel execution and number of workers adjustment
* `fullyParallel` and `workers` in `mobilewright.config.ts`
* One worker ≈ one concurrent device

#### 5- Fixtures
* Grouping page objects and navigation for sets of tests (`src/fixtures`)

#### 6- Global Setup
* Clears previous Allure results before the suite (`src/setup/global-setup.ts`)
* Builds the single-file Allure HTML after the suite (`src/setup/allure-html-reporter.ts`)

#### 7- Cross-platform projects
* Single suite, `ios` and `android` projects in one config
* Per-platform locators resolved inside the Page Object Model

#### 8- Device and app selection
* Env-driven device name / type / app path
* `installApps` before launch, or `SKIP_APP_INSTALL=1` when already installed

### B. Extra features:

#### 1- Page Object Model design pattern
* Each page class holds locators, a constructor, action methods, and assertion methods
* Specs call page methods only. They do not call `expect` on locators or on values read from the screen

#### 2- Project structure adjustment to modules
* Dividing the project into pages, components, fixtures, data, helpers, and setup

#### 3- Using data driven framework
* Separating test data to external TypeScript modules (`src/data`)
* Per-platform values via `PerPlatform<T>` where product names or messages differ

#### 4- Running on different devices / builds
* Passing device and app paths through CLI env / `.env`
* Adjustment of `bundleId` and `installApps` per project

#### 5- Handling platform differences
* `select({ android, ios })` and `pick()` hide platform branching from specs

#### 6- Allure report
* Allure with analytics, epic/feature/story/severity annotations
* Screenshots, view trees, and optional videos attached on failure / checkpoints
* Standalone `allure-report/index.html` is written when a test run finishes

#### 7- ESLint tool for static analysis
* ESLint dependency for TypeScript static analysis
* Flat `eslint.config.mjs` for project rules

#### 8- GitHub Actions
* GitHub-hosted and self-hosted E2E workflows under `.github/workflows`
* Self-hosted jobs stay opt-in: set the repository variable `SELF_HOSTED_E2E=true` after the Mac runner is registered, or run that workflow with `workflow_dispatch`

Web-only items from the Playwright twin project that do **not** apply here: Report Portal, multi-ENV ST/SIT URL matrices, REST API specs, visual snapshot baselines for browsers.

## `Contents:`

### A. Folders and directories:

#### 1- tests/:
* All mobile UI test case scripts (`.spec.ts`)

#### 2- src/pages/:
* Screen Page Objects (one class per screen)

#### 3- src/components/:
* Shared UI (e.g. navigation header / tab bar)

#### 4- src/fixtures/:
* Test fixtures that inject page objects and Allure context

#### 5- src/data/:
* Typed test data (products, users)

#### 6- src/helpers/:
* Platform selection, Android resource ids, reporting, text/geometry helpers

#### 7- src/setup/:
* `global-setup.ts` clears Allure results before a run
* `allure-html-reporter.ts` builds the single-file report after a run

#### 8- apps/:
* Downloaded APK / iOS simulator zip (git-ignored; created by `npm run apps:fetch`)

#### 9- mobilewright-report/:
* MobileWright HTML report output

#### 10- allure-results/ / allure-report/:
* Raw Allure results, and `index.html` written automatically after a test run

#### 11- test-results/:
* Screenshots, videos, traces, and other run artifacts

#### 12- node_modules/:
* Installed libraries and modules

#### 13- scripts/:
* `fetch-apps.sh`, `boot-android-emulator.sh`, `boot-ios-simulator.sh`, `allure-generate.mjs`

#### 14- docs/:
* `PLAN.md` — architecture and design record

### B. Project configuration files:

#### 1- mobilewright.config.ts:
* Platform projects, timeouts, reporters, workers, global setup, Allure HTML after the run, device/app options

#### 2- package.json:
* Project properties, scripts, dependencies

#### 3- package-lock.json:
* Locked dependency tree

#### 4- .gitignore:
* Files and folders excluded from version control

#### 5- .env / .env.example:
* Local environment variables (device names, app paths, video mode). Secrets never committed

#### 6- allurerc.ts:
* Allure 3 generate/open configuration (per-platform environments)

#### 7- .github/workflows/:
* CI pipelines for typecheck, iOS simulator, Android emulator, Allure publish

#### 8- eslint.config.mjs:
* Static analysis rules for TypeScript
* Uses `@typescript-eslint/parser` (type-aware plugin rules wait on typescript-eslint + TypeScript 7 support — pair with `npm run typecheck`)
* `postinstall` nests TypeScript 5.9 for the parser until upstream supports TS 7

#### 9- tsconfig.json / .nvmrc:
* TypeScript compiler options and Node version pin

## `Project Structure:`
*The below is a package diagram for the implemented project structure "Files and folders"*

```
mobilewright-framework/
│
├── tests/                                    # Thin, platform-agnostic specs
│   ├── login.spec.ts
│   ├── catalog.spec.ts
│   └── cart.spec.ts
│
├── src/
│   ├── pages/                                # Page Object Model
│   │   ├── base.page.ts
│   │   ├── catalog.page.ts
│   │   ├── product-details.page.ts
│   │   ├── cart.page.ts
│   │   └── login.page.ts
│   │
│   ├── components/                           # Shared UI
│   │   ├── base.component.ts
│   │   └── navigation.component.ts
│   │
│   ├── fixtures/                             # test.extend() page + Allure fixtures
│   │   └── index.ts
│   │
│   ├── data/                                 # Typed test data
│   │   ├── products.ts
│   │   └── users.ts
│   │
│   ├── helpers/                              # Platform, reporting, text, geometry
│   │   ├── platform.ts
│   │   ├── android.ts
│   │   ├── reporting.ts
│   │   ├── text.ts
│   │   └── geometry.ts
│   │
│   └── setup/
│       ├── global-setup.ts
│       ├── global-teardown.ts
│       └── allure-html-reporter.ts
│
├── scripts/
│   ├── fetch-apps.sh
│   ├── boot-android-emulator.sh
│   ├── boot-ios-simulator.sh
│   └── allure-generate.mjs
│
├── docs/
│   └── PLAN.md
│
├── apps/                                     # git-ignored builds
│   ├── android/my-demo-app.apk
│   └── ios/my-demo-app-simulator.zip
│
├── .github/
│   ├── actions/setup-project/
│   └── workflows/
│       ├── e2e-github-hosted.yml
│       ├── e2e-self-hosted.yml
│       └── allure-report.yml
│
├── mobilewright.config.ts
├── allurerc.ts
├── eslint.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── .nvmrc
└── README.md
```

### **Framework Architecture Flow:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Test Execution Flow                          │
└─────────────────────────────────────────────────────────────────────┘

1. Test Initialization
   ↓
   [mobilewright.config.ts] → Load projects (ios / android)
   ↓
   [global-setup.ts] → Suite pre-checks
   ↓
   [.env] → Device / app overrides

2. Test Execution (Mobile UI)
   ↓
   [test spec file] → AAA pattern + tags
   ↓
   [fixtures/index.ts] → Inject page objects + Allure labels
   ↓
   [page / component] → Locators + Actions + Assertions helpers
   ↓
   [src/data] → Typed credentials / products
   ↓
   Execute: Arrange → Act → Assert

3. Results & Reporting
   ↓
   ┌─────────────────┬──────────────────┬─────────────────┐
   │ Screenshots     │ View tree        │ Optional video  │
   └─────────────────┴──────────────────┴─────────────────┘
   ↓
   ┌──────────────────┬──────────────────────────┐
   │ MobileWright HTML│ allure-report/index.html │
   └──────────────────┴──────────────────────────┘
```

### **Page Object Model (POM) Structure:**

```
┌──────────────────────────────────────────────────────────────┐
│                    Page Class Structure                       │
└──────────────────────────────────────────────────────────────┘

PageObject Class (extends BasePage)
│
├── Locators Section
│   ├── elementName_btn (Button)
│   ├── elementName_tb (TextBox)
│   ├── elementName_lbl (Label)
│   └── elementName_mnu (Menu item)
│   └── Declared once; resolved with select({ android, ios })
│
├── Constructor
│   └── screen + platform from fixtures / BaseComponent
│
├── Action Methods
│   ├── tap{Element}Btn()
│   ├── type{Element}TB(value)
│   ├── loginAs(user) / addToCart()  (business actions preferred)
│   └── navigate helpers returning the next page
│
└── Assertion Methods (expect stays inside the page)
    ├── expectProductVisible(product) / expectPrice(price)
    ├── expectErrorVisible(message)
    ├── expectEmpty() / expectItemVisible(product)
    └── expectItemCount(count) / expectTotalCloseTo(expected)
```

### **Test Case AAA Pattern:**

```
Test Case Structure
│
├── Arrange (Setup)
│   ├── Load test data from src/data
│   ├── Open navigation / catalog via fixtures
│   └── Preconditions (device already booted; app installed or installApps)
│
├── Act (Execute)
│   ├── Perform user actions through page objects
│   ├── fill / tap / swipe
│   └── Cross-screen journeys via returned page objects
│
└── Assert (Verify)
    ├── Call page assertion methods (expect stays inside the page)
    ├── Verify screen state
    └── Validate data (prices, counts, errors)
```

## `General instructions and guidelines:`

* Specify files and tags that should be run according to business group and testing needs

* Configure package.json for frequently used commands

* Configure .env for device names, app paths, and optional video — never commit secrets

* Every test should have its representative name

* Pages hold locators, a constructor, action methods, and assertion methods

* Specs call those page methods only. Do not write `expect(locator...)` or `expect(await page.totalPrice())` in a spec

* Assertion methods use MobileWright `expect` (auto-waiting) inside the page class

* Files and folders should be named with this format `{firstWord-secondWord..}` (kebab-case for multi-word files)

* Variables and methods should start with small letters (camelCase)

* Locators should end with these formats `_lbl` for labels, `_tb` for text boxes, `_btn` for buttons, …

* Write locators, scenario steps and tests in the order of the screen under test

* Do not assert on existence of an element if you will assert on its text

* Do not write any functions if you will not use them

* We should not create a specific folder for the feature under test (specs stay flat under `tests/`)

* Platform-specific branching belongs in pages/components via `select` / `pick`, not in specs

* Tags that are used in the tests:

        - @ui: for native mobile UI tests
        - @regression: for the broader suite
        - @sanity / @smoke: for main scenarios (at most one primary sanity test per spec file)
        - @e2e: for longer journeys (few tests)

* Follow MobileWright docs for locator APIs:
https://mobilewright.dev/docs/getting-started/writing-tests

### `Framework standards:`

* **Locators format**

        - Button: buttonName_btn
        - Text box: textBoxName_tb
        - Label: labelName_lbl
        - Icons: iconName_icn
        - Images: imageName_img
        - Menu: menuName_mnu
        - Radio Button: radioButton_rb
        - Drop Down: dropDownListName_dd
        - Check box: checkBoxName_cb
        - Link: linkName_link
        - Text Area: textAreaName_ta
        - Table: tableName_tbl
        - Declare locators in the Locators section (class fields) and resolve with select()
        - DO NOT create locators inside action methods unless the selector needs a runtime value
        - Locator priority: getByTestId → getByRole → getByLabel → getByText
          (prefer stable accessibility / resource ids over visible text)

* **Methods**

* *Methods should be as the below format*

        - Tap on Button: tap{Element}Btn();
        - Type in TextBox: type{Element}TB(string value);
        - Prefer business actions when a sequence is reused: loginAs(user), addToCart()
        - Do not use the "promise" keyword
        - Not recommended to use loops or if/else in specs (platform if/else belongs in POM)
        - Not recommended to pass parameters to methods unless required for data-driven cases

* **Assertions / Validations / Verifications**

* *Assertions live on the page and are called from the spec*

        await catalog.expectProductVisible(products.backpack);
        await login.expectErrorVisible(loginErrors.usernameRequired);
        await cart.expectEmpty();
        await cart.expectItemVisible(products.backpack);
        await cart.expectItemCount(1);
        await cart.expectTotalCloseTo(expected);
        await details.expectProductVisible(product);
        await details.expectPrice(product.price);

        - The page method wraps MobileWright `expect` (`toBeVisible`, `toHaveText`, `toBeCloseTo`, …)
        - Specs do not import `expect` for UI checks
        - Prefer asserting at the end of the case (AAA)

* **Test cases**

        - DO NOT assert in the middle of a case — all assertions only at the end; split into another case if a mid-check is needed
        - DO NOT use actions after assertions in assert methods
        - DO NOT write hard coded numbers and texts inside the code and methods (use src/data)
        - DO NOT use in the code any personal names or any names outside the application business
        - DO NOT use retry for/while loops just to wait longer; rely on MobileWright auto-wait / timeouts
        - DO NOT add a separate wait when tap() / expect() already waits
        - Platform-specific copy belongs in PerPlatform data, not in specs
        - If the test case is e2e it should get tags "@e2e, @sanity, @regression, @ui"
        - If the test case is a main happy path it should get "@sanity" (or "@smoke") plus "@ui" and "@regression"
        - Test case name should be in this pattern [**Check that** {expectedResult} **when** {action}]
        - Spec file represents the feature
        - If there is a new feature we create a new spec file
        - If we modify an old feature, we modify the old spec file for that feature
        - If there is a new screen we create a new page class
        - Page classes serve more than one spec file for features under that screen
