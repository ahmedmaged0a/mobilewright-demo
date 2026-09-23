import globalTeardown, { type TeardownConfig } from './global-teardown.ts';

interface ReporterOptions {
  readonly _mode?: string;
  readonly configDir?: string;
}

export default class AllureHtmlReporter {
  private readonly listMode: boolean;
  private readonly configDir: string | undefined;
  private teardownConfig: TeardownConfig | undefined;

  constructor(options: ReporterOptions = {}) {
    this.listMode = options._mode === 'list';
    this.configDir = options.configDir;
  }

  onBegin(config: TeardownConfig): void {
    this.teardownConfig = config;
  }

  printsToStdio(): boolean {
    return false;
  }

  onExit(): void {
    if (this.listMode || !this.teardownConfig) {
      return;
    }
    globalTeardown(this.teardownConfig, this.configDir);
  }
}
