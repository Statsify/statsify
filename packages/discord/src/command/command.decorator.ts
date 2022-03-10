import type { CommandMetadata, CommandOptions } from './command.interface';

export function Command(options: CommandOptions): ClassDecorator {
  return (target) => {
    const metadata: CommandMetadata = {
      ...options,
      name: options.name ?? target.name.toLowerCase().replace('command', ''),
      methodName: 'run',
    };

    Reflect.defineMetadata('statsify:command', metadata, target);
  };
}
