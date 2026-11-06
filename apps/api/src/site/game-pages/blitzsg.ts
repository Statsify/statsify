/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BLITZSG } from "@statsify/catalog";
import { type GameLayout, type PageSpec, prefixLevel } from "./layout.js";
import type { ApiModeFromGameModes, BlitzSGModes, PlayerStats } from "@statsify/schemas";

/** Overall's table, then Solo and Doubles side by side, as on the card. */
const OVERALL: PageSpec = {
  sections: [
    { name: "§6Overall", rows: [["wins", "kills", "deaths", "kdr"]] },
    { name: "§6Solo", box: true, rows: [[{ key: "wins", at: "solo" }, { key: "kills", at: "solo" }]] },
    { name: "§6Doubles", box: true, rows: [[{ key: "wins", at: "doubles" }, { key: "kills", at: "doubles" }]] },
  ],
};

/** Every kit's table, then the kit's level and EXP, which the card shows once the kit has a level. */
const kit = (mode: string): PageSpec => {
  const levelled = (_: unknown, { blitzsg }: PlayerStats) =>
    blitzsg[mode as Exclude<ApiModeFromGameModes<BlitzSGModes>, "overall">].level > 0;

  return {
    sections: [
      { rows: [["wins", "losses", "wlr"], ["kills", "deaths", "kdr"], ["playtime", "gamesPlayed"]] },
      { title: "game.sections.kit", rows: [[{ key: "level", when: levelled }, { key: "exp", when: levelled }]] },
    ],
  };
};

export const BLITZSG_PAGE: GameLayout = {
  game: BLITZSG,
  // Every kit in the registry's order, so a kit's place doesn't move from player to player.
  selected: ({ blitzsg }) => blitzsg.kit.toLowerCase().replaceAll(/[^a-z]/g, ""),
  // Two words in Hypixel's own stat keys ("shadow knight", "hype train"), one in the registry's.
  modeNames: { shadowknight: "Shadow Knight", hypetrain: "Hype Train" },
  level: {
    key: "kills",
    at: "overall",
    label: "stats.prefix",
    progress: "stats.progression.kill",
    read: ({ blitzsg }) => prefixLevel(blitzsg),
  },
  overview: ["coins", { key: "kit", inline: true }],
  mostPlayed: {},
  page: (mode) => (mode === "overall" ? OVERALL : kit(mode)),
};
