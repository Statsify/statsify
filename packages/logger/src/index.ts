import type { ConsoleLoggerOptions, LoggerService, LogLevel } from '@nestjs/common';
import chalk from 'chalk';

const defaultLogLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

export interface LoggerOptions extends ConsoleLoggerOptions {
  icon?: string;
}

export class Logger implements LoggerService {
  protected options: LoggerOptions;
  private originalContext?: string;
  private static lastTimeStampAt?: number;

  public constructor(protected context?: string, options: LoggerOptions = {}) {
    this.options = {
      icon: '📈',
      logLevels: defaultLogLevels,
      ...options,
    };

    if (context) {
      this.originalContext = context;
    }
  }

  public log(message: any, context?: string): void;
  public log(message: any, ...optionalParams: [...any, string?]): void;
  public log(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('log')) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([message, ...optionalParams]);

    this.printMessage(messages, context, 'log');
  }

  public error(message: any, context?: string): void;
  public error(message: any, ...optionalParams: [...any, string?]): void;
  public error(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('error')) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([message, ...optionalParams]);

    this.printMessage(messages, context, 'error', 'stderr');
  }

  public warn(message: any, context?: string): void;
  public warn(message: any, ...optionalParams: [...any, string?]): void;
  public warn(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('warn')) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([message, ...optionalParams]);

    this.printMessage(messages, context, 'warn');
  }

  public debug(message: any, context?: string): void;
  public debug(message: any, ...optionalParams: [...any, string?]): void;
  public debug(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('debug')) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([message, ...optionalParams]);

    this.printMessage(messages, context, 'debug');
  }

  public verbose(message: any, context?: string): void;
  public verbose(message: any, ...optionalParams: [...any, string?]): void;
  public verbose(message: any, ...optionalParams: any[]): void {
    if (!this.isLevelEnabled('verbose')) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([message, ...optionalParams]);

    this.printMessage(messages, context, 'verbose');
  }

  public setLogLevels(levels: LogLevel[]) {
    this.options.logLevels = levels;
  }

  public setContext(context: string) {
    this.context = context;
  }

  public resetContext() {
    this.context = this.originalContext;
  }

  public isLevelEnabled(level: LogLevel) {
    return this.options.logLevels.includes(level);
  }

  private getContextAndMessages(messages: unknown[]) {
    if (messages.length <= 1) {
      return { messages, context: this.context };
    }

    const lastEl = messages[messages.length - 1];
    const isContext = typeof lastEl === 'string';

    if (isContext) {
      return {
        messages: messages.slice(0, -1),
        context: lastEl,
      };
    }

    return { messages, context: this.context };
  }

  private getColorByLogLevel(logLevel: LogLevel) {
    switch (logLevel) {
      case 'debug':
        return '#C700E7';
      case 'warn':
        return '#FAB627';
      case 'error':
        return '#DA4E38';
      case 'verbose':
        return '#6469F5';
      default:
        return '#36D494';
    }
  }

  private getTimeStamp() {
    const now = Date.now();

    if (!Logger.lastTimeStampAt) {
      Logger.lastTimeStampAt = now;
      return 0;
    }

    const diff = now - Logger.lastTimeStampAt;
    Logger.lastTimeStampAt = now;

    return diff;
  }

  private printMessage(
    messages: unknown[],
    context = 'Default',
    logLevel: LogLevel = 'log',
    writeStreamType: 'stdout' | 'stderr' = 'stdout'
  ) {
    const color = this.getColorByLogLevel(logLevel);

    messages.forEach((message) => {
      const output = typeof message === 'object' ? JSON.stringify(message) : message;
      const timeStamp = this.getTimeStamp();

      const computedMessage = `${chalk.bold`${this.options.icon}`} ${chalk.hex(color)(
        context
      )} ${chalk.gray`${timeStamp}ms`} ${output}\n`;

      process[writeStreamType].write(computedMessage);
    });
  }
}
