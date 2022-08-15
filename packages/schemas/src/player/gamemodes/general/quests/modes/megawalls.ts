/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const MegaWallsQuests = createGameModeQuests({
  game: FormattedGame.MEGAWALLS,
  fieldPrefix: "mega_walls",
  daily: [
    { field: "play", propertyKey: "gameOfTheDay" },
    { field: "win", propertyKey: "win" },

    //TODO(vnmm): are these flip flopped?
    { field: "kill", propertyKey: "faithful" },
    { field: "faithful", propertyKey: "kills" },
  ],
  weekly: [{ field: "weekly", propertyKey: "megaWaller" }],
});
