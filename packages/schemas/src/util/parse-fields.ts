/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function parseAdditionalFields(field: string, additionalKey: string) {
  if (!additionalKey.startsWith("this.")) return additionalKey;

  const fieldParts = field.split(".");
  fieldParts.pop();

  const additionalFieldParts = additionalKey.split(".").slice(1);
  const ending = additionalFieldParts.pop();

  if (!additionalFieldParts.length) return [...fieldParts, ending].join(".");

  const splitIndex = fieldParts.findIndex((part) => additionalFieldParts.includes(part));

  if (splitIndex === -1)
    return [...fieldParts, ...additionalFieldParts, ending].join(".");

  return [...fieldParts.slice(0, splitIndex), ...additionalFieldParts, ending].join(".");
}
