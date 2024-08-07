/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { primitiveConstructors } from "../constants.js";
import type { TypeMetadata } from "../metadata.interface.js";
import type { TypeOptions } from "../field.options.js";

export const getTypeMetadata = (
  typeOptions: TypeOptions | undefined,
  target: object,
  propertyKey: string | symbol
): TypeMetadata => {
  if (typeOptions) {
    const type = typeOptions();

    if (Array.isArray(type))
      return {
        type: type[0],
        array: true,
        primitive: primitiveConstructors.includes(type[0]),
      };

    return {
      type,
      array: false,
      primitive: primitiveConstructors.includes(type),
    };
  }

  const type = Reflect.getMetadata("design:type", target, propertyKey);

  return {
    type,
    array: false,
    primitive: primitiveConstructors.includes(type),
  };
};
