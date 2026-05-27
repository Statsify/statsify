/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const TurboKartRacersQuests = createGameModeQuests({
  game: FormattedGame.TURBO_KART_RACERS,
  fieldPrefix: "gingerbread",
  daily: [
    { field: "bling_bling", propertyKey: "blingBling" },
    { field: "maps", propertyKey: "internationalChampionship" },
    { field: "racer", propertyKey: "racer" },
  ],
  weekly: [{ field: "mastery", propertyKey: "turboKartRacers" }],
});
