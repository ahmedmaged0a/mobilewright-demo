import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = join(root, 'allure-report');
const allureBin = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'allure.cmd' : 'allure');

rmSync(reportDir, { recursive: true, force: true });

const result = spawnSync(allureBin, ['generate'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if ((result.status ?? 1) !== 0) {
  process.exit(result.status ?? 1);
}

if (!existsSync(reportDir)) {
  console.error('allure generate did not create allure-report');
  process.exit(1);
}

for (const name of readdirSync(reportDir)) {
  if (name !== 'index.html') {
    rmSync(join(reportDir, name), { recursive: true, force: true });
  }
}

if (!existsSync(join(reportDir, 'index.html'))) {
  console.error('allure generate did not write allure-report/index.html');
  process.exit(1);
}
