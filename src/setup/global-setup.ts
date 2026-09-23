import { rmSync } from 'node:fs';

/** The part of Playwright's resolved `FullConfig` this setup reads. */
interface ResolvedConfig {
  readonly reporter: ReadonlyArray<readonly [string, unknown?]>;
}

/** Playwright resolves reporter names to module paths, e.g. `.../node_modules/allure-playwright/dist/...`. */
const ALLURE_REPORTER = /(^|[\\/])allure-playwright([\\/]|$)/;

function allureResultsDir({ reporter }: ResolvedConfig): string | undefined {
  const options = reporter.find(([name]) => ALLURE_REPORTER.test(name))?.[1];
  if (typeof options === 'object' && options !== null && 'resultsDir' in options) {
    return typeof options.resultsDir === 'string' ? options.resultsDir : undefined;
  }
  return undefined;
}

/** allure-playwright appends to its results folder, so every run starts from a clean one. */
export default function globalSetup(config: ResolvedConfig): void {
  const resultsDir = allureResultsDir(config);
  if (resultsDir) {
    rmSync(resultsDir, { recursive: true, force: true });
  }
}
