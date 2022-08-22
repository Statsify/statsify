/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../game";
import { createGameModeQuests } from "../util";

export const UHCQuests = createGameModeQuests({
  game: FormattedGame.UHC,
  fieldPrefix: "uhc",
  daily: [
    { field: "team", propertyKey: "teamUHCChampions", fieldName: "Team UHC Champions" },
    { field: "solo", propertyKey: "soloUHCChampions", fieldName: "Solo UHC Champions" },
    { field: "dm", propertyKey: "uhcDeathmatch", fieldName: "UHC Deathmatch" },
  ],
  weekly: [{ field: "weekly", propertyKey: "uhcChampions", fieldName: "UHC Champions" }],
});
