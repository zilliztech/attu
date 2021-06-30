import { LoggerService } from '@nestjs/common';
import * as chalk from 'chalk';

export class ConsoleLogger implements LoggerService {
  log(...messages: any[]) {
    // tslint:disable-next-line:no-console
    console.log(chalk.green(`milvus-insight: [${ConsoleLogger.time()}]`), ...messages);
  }
  error(...messages: any[]) {
    // tslint:disable-next-line:no-console
    console.error(chalk.red(`error: [${ConsoleLogger.time()}]`), ...messages);
  }
  warn(...messages: any[]) {
    // tslint:disable-next-line:no-console
    console.warn(chalk.yellow(`warn: [${ConsoleLogger.time()}]`), ...messages);
  }
  static time() {
    return new Date().toISOString();
  }
}
