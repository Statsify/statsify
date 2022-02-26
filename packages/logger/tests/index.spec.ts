import chalk from 'chalk';
import { defaultLogLevels, logColors, Logger } from '../src';
defaultLogLevels.forEach((logLevel) => {
  describe(`logging of ${logLevel}`, () => {
    it(`should ${logLevel}`, () => {
      const logger = new Logger(logLevel);

      //@ts-ignore Set timestamp to 0ms to make tests pass
      Logger.lastTimeStampAt = 0;

      const mock = jest.fn();

      process.stdout.write = mock;
      process.stderr.write = mock;

      logger[logLevel]('message');

      expect(mock).toHaveBeenCalledWith(
        `${chalk.bold`${logLevel === 'error' ? '📉' : '📈'}`} ${chalk.hex(logColors[logLevel])(
          logLevel
        )} ${chalk.gray`0ms`} message\n`
      );
    });
  });
});

describe(`logging levels`, () => {
  it('should ignore all log levels', () => {
    const logger = new Logger('default', { logLevels: [] });

    const mock = jest.fn();

    process.stdout.write = mock;
    process.stderr.write = mock;

    defaultLogLevels.forEach((logLevel) => {
      logger[logLevel]('message');
    });

    expect(mock).not.toHaveBeenCalled();
  });
});
