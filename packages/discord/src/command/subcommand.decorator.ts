/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { SubCommandMetadata, SubCommandOptions } from "./command.interface.js";

export function SubCommand(options: SubCommandOptions): MethodDecorator {
  return (target, propertyKey) => {
    const oldMetadata = Reflect.getMetadata("statsify:subcommand", target);

    const metadata: SubCommandMetadata = {
      ...oldMetadata,
      [propertyKey]: {
        ...oldMetadata?.[propertyKey],
        ...options,
        name: options.name ?? (propertyKey as string).toLowerCase(),
        methodName: propertyKey as string,
      },
    };

    Reflect.defineMetadata("statsify:subcommand", metadata, target);
  };
}
