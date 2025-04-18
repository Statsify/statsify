/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export { twMerge as cn } from "tailwind-merge";

export function splitSlotClasses<Slot extends string>(slots: Slot[], classNames: string): Record<Slot | "defaultClass", string> {
  const classes: Record<string, string> = {
    defaultClass: "",
  };

  for (const slot of slots) {
    classes[slot] = "";
  }

  for (const className of classNames.split(" ")) {
    for (const slot of slots) {
      if (className.startsWith(`${slot}:`)) {
        classes[slot] += ` ${className.slice(slot.length + 1)}`;
      } else {
        classes.defaultClass += ` ${className}`;
      }
    }
  }

  return classes;
}
