import { rmSync } from 'node:fs';

export interface ResolvedConfig {
  readonly reporter: ReadonlyArray<readonly [string, unknown?]>;
}

const ALLURE_REPORTER = /(^|[\\/])allure-playwright([\\/]|$)/;

export function allureResultsDir({ reporter }: ResolvedConfig): string | undefined {
  const options = reporter.find(([name]) => ALLURE_REPORTER.test(name))?.[1];
  if (typeof options === 'object' && options !== null && 'resultsDir' in options) {
    return typeof options.resultsDir === 'string' ? options.resultsDir : undefined;
  }
  return undefined;
}

export default function globalSetup(config: ResolvedConfig): void {
  const resultsDir = allureResultsDir(config);
  if (resultsDir) {
    rmSync(resultsDir, { recursive: true, force: true });
  }
}
