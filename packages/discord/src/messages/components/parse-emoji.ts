/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIMessageComponentEmoji } from "discord-api-types/v10";
import { LocalizationString, LocalizeFunction, translateField } from "../localize.js";

export function parseEmoji(
  emote: LocalizationString,
  locale: LocalizeFunction
): APIMessageComponentEmoji {
  const emoji = translateField(locale, emote);
  const animated = emoji.startsWith("<a:");
  const name = emoji.replace(/<:|<a:|>/g, "");
  const id = name.split(":")[1];

  return { name: name.replace(id, ""), animated, id };
}
