/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const WarlordsQuests = createGameModeQuests({
  game: FormattedGame.WARLORDS,
  fieldPrefix: "warlords",
  daily: [
    { field: "ctf", propertyKey: "captureTheFlag" },
    { field: "tdm", propertyKey: "teamDeathmatch" },
    { field: "domination", propertyKey: "domination" },
    { field: "victorious", propertyKey: "victorious" },
    { field: "objectives", propertyKey: "carrySecured", name: "Carry, Secured!" },
  ],
  weekly: [
    { field: "dedication", propertyKey: "dedication" },
    { field: "all_star", propertyKey: "allStar" },
  ],
});
