import type { SubCommandOptions } from './command.interface';

export function SubCommand(options: SubCommandOptions): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(
      'statsify:subcommand',
      {
        ...options,
        name: options.name ?? (propertyKey as string).toLowerCase(),
      },
      target,
      propertyKey
    );
  };
}
