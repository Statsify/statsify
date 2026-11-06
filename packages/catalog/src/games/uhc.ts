/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, selection } from "../catalog.js";
import { UHC_MODES, type UHCModes } from "@statsify/schemas";

/** The colours and labels of the bot's UHC card (`uhc.profile.tsx`): its sidebar and the table every mode shares. */
export const UHC: Game<UHCModes> = {
  key: "uhc",
  id: "UHC",
  modes: UHC_MODES,
  game: {
    coins: { colour: "§6" },
    score: { colour: "§b" },
    // The title as stored and the kit prettified, as the card shows them.
    title: { colour: "§e" },
    kit: selection("§a"),
  },
  shapes: [
    {
      modes: ["overall", "solo", "teams"],
      stats: {
        wins: { colour: "§e" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        headsEaten: { colour: "§6" },
        ultimatesCrafted: { colour: "§b" },
        extraUltimates: { colour: "§d" },
      },
    },
  ],
};
