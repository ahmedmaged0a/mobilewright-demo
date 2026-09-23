import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { allureResultsDir, type ResolvedConfig } from './global-setup.ts';

const RESULT_FILE = /-result\.json$/;

export interface TeardownConfig extends ResolvedConfig {
  readonly configFile?: string;
}

function projectDir(config: TeardownConfig): string {
  if (config.configFile) {
    return dirname(config.configFile);
  }
  return process.cwd();
}

export default function globalTeardown(config: TeardownConfig, configDir?: string): void {
  const resultsDir = allureResultsDir(config);
  if (!resultsDir) {
    return;
  }

  const root = configDir || projectDir(config);
  const absoluteResults = resolve(root, resultsDir);
  if (!existsSync(absoluteResults) || !readdirSync(absoluteResults).some((name) => RESULT_FILE.test(name))) {
    return;
  }

  const result = spawnSync('npm', ['run', 'allure:generate'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    throw new Error(`npm run allure:generate failed (${result.status ?? result.signal ?? 'unknown'})`);
  }
}
