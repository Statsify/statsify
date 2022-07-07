/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RestResponse } from "tiny-discord";

export const parseDiscordResponse = <T>(response: RestResponse): T => {
  if (response.status >= 200 && response.status < 300) return response.body as T;

  const body = response.body as Record<string, any>;

  let message = body.message;

  if (body.errors) {
    const error = parseDiscordError(body.errors);
    message += ` | ${error}`;
  }

  throw new Error(message);
};

export const parseDiscordError = (error: any = {}, errorKey = ""): string => {
  if (typeof error.message === "string")
    return `${errorKey.length ? `${errorKey} - ${error.code}` : `${error.code}`}: ${
      error.message
    }`.trim();

  const entries = Object.entries(error) as [string, any][];
  let message = "";

  for (const [key, value] of entries) {
    const nextKey = key.startsWith("_")
      ? errorKey
      : errorKey
      ? Number.isNaN(Number(key))
        ? `${errorKey}.${key}`
        : `${errorKey}[${key}]`
      : key;

    if (typeof value === "string") message += value;
    else if ("_errors" in value)
      for (const error of value._errors) message += parseDiscordError(error, nextKey);
    else message += parseDiscordError(value, nextKey);
  }

  return message;
};