/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Service } from "typedi";
import type { CommandMetadata, CommandOptions } from "./command.interface";

export function Command(options: CommandOptions): ClassDecorator {
  return (target) => {
    const metadata: CommandMetadata = {
      ...Reflect.getMetadata("statsify:command", target),
      ...options,
      name: options.name ?? target.name.toLowerCase().replace("command", ""),
      methodName: "run",
    };

    Service()(target);

    Reflect.defineMetadata("statsify:command", metadata, target);
  };
}
