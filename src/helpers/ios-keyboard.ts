import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function dismissIOSSoftwareKeyboard(): Promise<void> {
  try {
    await execFileAsync('osascript', [
      '-e',
      'tell application "Simulator" to activate',
      '-e',
      'tell application "System Events" to keystroke "k" using command down',
    ]);
  } catch {
    return;
  }
}
