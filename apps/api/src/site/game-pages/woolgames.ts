/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CellSpec, type GameLayout, type PageSpec, formattedLevel, selectedMode } from "./layout.js";
import { WOOL_GAMES, WOOL_WARS_CLASSES } from "@statsify/catalog";
import type { PlayerStats } from "@statsify/schemas";

const KILLS = ["kills", "deaths", "kdr", "assists"];
const GAMEPLAY = ["woolPlaced", "blocksBroken", "powerups"];

/** A Capture The Wool time, shown only once it's set, as on the card. */
const time = (key: "fastestWin" | "fastestWoolCapture" | "longestGame"): CellSpec => ({
  key,
  when: (_, { woolgames }: PlayerStats) => woolgames.captureTheWool[key] > 0,
  session: false,
});

/**
 * Wool Wars' Overall, or one of its classes: the card's table, then the sidebar's wool, blocks and power-ups, each
 * class with its own.
 */
const woolWars = (submode: string): PageSpec =>
  submode === "overall" ?
    {
      sections: [
        { rows: [["wins", "losses", "wlr"], KILLS] },
        { title: "game.sections.gameplay", rows: [[...GAMEPLAY, "gamesPlayed"]] },
      ],
    } :
    { sections: [{ rows: [KILLS] }, { title: "game.sections.gameplay", rows: [GAMEPLAY] }] };

const SHEEP_WARS: PageSpec = {
  sections: [
    { rows: [["wins", "losses", "wlr"], ["kills", "deaths", "kdr"], ["gamesPlayed"], [{ key: "kit", inline: true }]] },
    { title: "game.sections.sheep", rows: [["magicWool", "sheepThrown", "sheepKilled"]] },
    { title: "game.sections.kills", rows: [["explosiveKills", "voidKills", "bowKills", "meleeKills"]] },
  ],
};

/** The card's Overall box, the sidebar's gold beside it, and its two wool holder boxes below. */
const CAPTURE_THE_WOOL: PageSpec = {
  sections: [
    {
      name: "§6Overall",
      rows: [
        ["wins", "losses", "wlr", "draws"],
        KILLS,
        ["woolPickedUp", "woolCaptured"],
        [time("fastestWin"), time("fastestWoolCapture"), time("longestGame")],
      ],
    },
    { title: "game.sections.gold", rows: [["goldEarned", "goldSpent"]] },
    { title: "game.sections.againstWoolHolder", colour: "§6", box: true, rows: [["killsOnWoolHolder", "deathsToWoolHolder"]] },
    { title: "game.sections.asWoolHolder", colour: "§6", box: true, rows: [["killsAsWoolHolder", "deathsAsWoolHolder"]] },
  ],
};

/**
 * The card's header and sidebar over a table per mode, with no Overall. Wool Wars' classes are submodes, Overall first,
 * the player's own marked.
 */
export const WOOL_GAMES_PAGE: GameLayout = {
  game: WOOL_GAMES,
  modes: WOOL_GAMES.modes.getModes().map(({ api, submodes }) =>
    api === "woolwars" ?
      {
        key: api,
        submodes: submodes.map(({ api: key, formatted: name }) => ({ key, name })),
        // Unset before the player is first saved, for one who never picked a class (saved, it reads "none").
        selected: ({ woolgames }) => selectedMode(WOOL_GAMES, woolgames.woolwars.class ?? "", WOOL_WARS_CLASSES),
      } :
      { key: api }),
  // The level is looked up from EXP, whose (hidden) leaderboard ranks it.
  level: { key: "exp", read: ({ woolgames }) => formattedLevel(woolgames) },
  overview: ["coins", "layers", "playtime", "wins"],
  // By wins and losses, which every mode stores (Capture The Wool stores no games played); Wool Wars keeps its record on
  // its Overall.
  mostPlayed: { by: "winsLosses", place: (mode) => (mode === "woolwars" ? "woolwars.overall" : mode) },
  page: (mode, submode) => {
    if (mode === "woolwars") return woolWars(submode!);
    return mode === "sheepwars" ? SHEEP_WARS : CAPTURE_THE_WOOL;
  },
};
