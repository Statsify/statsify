import { Service } from 'typedi';
import type { CommandMetadata, CommandOptions } from './command.interface';

export function Command(options: CommandOptions): ClassDecorator {
  return (target) => {
    const metadata: CommandMetadata = {
      ...Reflect.getMetadata('statsify:command', target),
      ...options,
      name: options.name ?? target.name.toLowerCase().replace('command', ''),
      methodName: 'run',
    };

    Service()(target);

    Reflect.defineMetadata('statsify:command', metadata, target);
  };
}
