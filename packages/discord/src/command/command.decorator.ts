import type { CommandOptions } from './command.interface';

export function Command(options: CommandOptions): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(
      'statsify:command',
      {
        ...options,
        name: options.name ?? target.name.toLowerCase().replace('command', ''),
      },
      target
    );
  };
}
