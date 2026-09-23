#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

let estreeRoot;
try {
  estreeRoot = dirname(require.resolve('@typescript-eslint/typescript-estree/package.json'));
} catch {
  process.exit(0);
}

const nestedTs = join(estreeRoot, 'node_modules', 'typescript', 'package.json');
if (existsSync(nestedTs)) {
  process.exit(0);
}

const result = spawnSync(
  'npm',
  ['install', 'typescript@5.9.3', '--no-save', '--legacy-peer-deps'],
  { cwd: estreeRoot, stdio: 'inherit', shell: process.platform === 'win32' },
);
process.exit(result.status ?? 1);
