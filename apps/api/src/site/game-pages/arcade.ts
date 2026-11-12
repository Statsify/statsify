/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, DROPPER_DIFFICULTIES, modeName, shapeKeys } from "@statsify/catalog";
import type { CellSpec, GameLayout, PageSpec, SectionSpec } from "./layout.js";
import type { PlayerStats } from "@statsify/schemas";

/** Keys stored somewhere other than the page's place. */
const at = (place: string, keys: string[]): CellSpec[] => keys.map((key) => ({ key, at: place }));

const keysOf = (place: string, filter: (key: string) => boolean = () => true) => shapeKeys(ARCADE, place).filter(filter);

/** Each mode's wins on Overall, as the card lists them (Creeper Attack has none). */
const MODE_WINS: [mode: string, place: string, key: string][] = [
  ["blockingDead", "blockingDead", "wins"],
  ["bountyHunters", "bountyHunters", "wins"],
  ["disasters", "disasters", "wins"],
  ["dragonWars", "dragonWars", "wins"],
  ["dropper", "dropper", "wins"],
  ["enderSpleef", "enderSpleef", "wins"],
  ["farmHunt", "farmHunt", "wins"],
  ["football", "football", "wins"],
  ["galaxyWars", "galaxyWars", "wins"],
  ["hideAndSeek", "hideAndSeek.overall", "wins"],
  ["holeInTheWall", "holeInTheWall", "wins"],
  ["hypixelSays", "hypixelSays", "wins"],
  ["miniWalls", "miniWalls", "wins"],
  ["partyGames", "partyGames", "wins"],
  ["pixelPainters", "pixelPainters", "wins"],
  ["pixelParty", "pixelParty.overall", "wins"],
  ["seasonal", "seasonal", "totalWins"],
  ["throwOut", "throwOut", "wins"],
  ["zombies", "zombies.overall", "wins"],
];

// The card's ranking: highest first, in rows of four, each row a color down from §b.
const OVERALL: PageSpec = {
  heading: { word: "game.wins" },
  sections: [
    {
      cells: MODE_WINS.map(([mode, place, key]) => ({ key, at: place, name: modeName(ARCADE, mode) })),
      sort: "desc",
      ranks: { size: 4, colors: ["§b", "§a", "§e", "§6", "§c"] },
    },
  ],
};

const ZOMBIES_MAPS: [map: string, name: string][] = [
  ["deadEnd", "§#813781Dead End"],
  ["badBlood", "§#8f1721Bad Blood"],
  ["alienArcadium", "§#75ae00Alien Arcadium"],
  ["prison", "§#aaa5c2Prison"],
];

const DIFFICULTIES: [difficulty: string, name: string][] = [
  ["overall", "§6Overall"],
  ["normal", "§aNormal"],
  ["hard", "§cHard"],
  ["rip", "§4RIP"],
];

/** Whether a cell's map or difficulty has a win, after which the card shows Wins or Fastest Win over Best Round. */
const won = (_: unknown, __: unknown, { wins }: Record<string, unknown>) => Number(wins) > 0;
const unwon: typeof won = (...args) => !won(...args);

/** A Zombies block: the card's Wins (Best Round before a win), Kills and Deaths, then Fastest Win and Total Rounds. */
const zombiesBlock = (place: string): CellSpec[][] => [
  [{ key: "wins", at: place, when: won }, { key: "bestRound", at: place, when: unwon, session: false }, ...at(place, ["kills", "deaths"])],
  [{ key: "fastestWin", at: place, session: false }, { key: "totalRounds", at: place, session: false }, ...at(place, ["doorsOpened"])],
];

function zombies(submode: string): PageSpec {
  if (submode === "overall") {
    return {
      sections: [
        { name: "§6Overall", rows: [["wins", "kills", "deaths"], [{ key: "totalRounds", session: false }, "doorsOpened"]] },
        // Each map's Overall as Zombies › Overall shows it: Wins, then Fastest Win once won, else Best Round, in §e.
        ...ZOMBIES_MAPS.map(([map, name]): SectionSpec => {
          const place = map === "alienArcadium" ? "zombies.alienArcadium" : `zombies.${map}.overall`;
          const color = "§e" as const;
          return {
            name,
            box: true,
            rows: [
              [
                { key: "wins", at: place },
                { key: "fastestWin", at: place, colour, when: won, session: false },
                { key: "bestRound", at: place, colour, when: unwon, session: false },
              ],
            ],
          };
        }),
      ],
    };
  }

  if (submode === "alienArcadium") return { sections: [{ rows: zombiesBlock("zombies.alienArcadium") }] };

  return {
    sections: DIFFICULTIES.map(([difficulty, name]) => ({ name, box: true, rows: zombiesBlock(`zombies.${submode}.${difficulty}`) })),
  };
}

const SEASONAL: [place: string, name: string, stat: string][] = [
  [
    "seasonal.easterSimulator",
    "§#e775b0E§#d88fa1a§#c9a991s§#bac382t§#abdd72e§#9dec6er §#91e780S§#85e292i§#78dca4m§#6cd7b6u§#74c9bel§#85b8c1a§#97a7c5t§#a895c8o§#ba84cbr",
    "eggsFound",
  ],
  [
    "seasonal.grinchSimulator",
    "§#409384G§#4da995r§#59c0a6i§#66d6b7n§#7fe4c7c§#a5ebd7h §#ccf1e6S§#f2f8f6i§#e9c1c3m§#e08a90u§#d7535dl§#ca3541a§#b92f3dt§#a82838o§#972234r",
    "giftsFound",
  ],
  [
    "seasonal.halloweenSimulator",
    "§#f6921dH§#ea851ea§#de771fl§#d16a20l§#c55c21o§#b94f22w§#af4527e§#a94334e§#a34141n §#9e3f4fS§#983d5ci§#923b69m§#903b6eu§#903c70l§#903d72a§#903f73t§#904075o§#904177r",
    "candyFound",
  ],
  [
    "seasonal.scubaSimulator",
    "§#ed4f46S§#ef5855c§#f06165u§#f26b74b§#f37484a §#f48a96S§#f4a6a9i§#f3c3bcm§#f3dfcfu§#e0ebd9l§#a8d5d0a§#70c0c8t§#38aabfo§#0095b6r",
    "points",
  ],
];

const PARTY_ROUNDS = (suffix: string) => keysOf("partyGames", (key) => key.endsWith(suffix));

/** Whether the player has a Dropper best time, without which the card leaves out its row. */
const timed = (_: unknown, { arcade }: PlayerStats) => arcade.dropper.bestTime > 0;

/** A stat of every Dropper map, a row per difficulty under the card's heading for it. */
const DROPPER_LIST = (key: string): Pick<SectionSpec, "rows" | "rowNames"> => ({
  rows: DROPPER_DIFFICULTIES.map(({ maps }) => maps.map(([map]) => ({ key, at: `dropper.maps.${map}` }))),
  rowNames: DROPPER_DIFFICULTIES.map(({ name }) => name),
});

/**
 * One page per card, its first block the headline and its others sections under the card's headings. The card's
 * Disasters, Dropper and Party Games sub-pages are sections here: other stats of the same games, not a subset of them.
 */
const PAGES: Record<string, PageSpec> = {
  blockingDead: { sections: [{ rows: [["wins", "kills", "headshots"]] }] },
  bountyHunters: {
    sections: [
      { rows: [["wins", "bountyKills"], ["kills", "deaths", "kdr"]] },
      { title: "game.sections.weapons", rows: [["bowKills", "swordKills"]] },
    ],
  },
  creeperAttack: { sections: [{ rows: [[{ key: "maxWave", session: false }]] }] },
  disasters: {
    sections: [
      {
        rows: [
          ["wins", "losses", "wlr"],
          ["gamesPlayed", "playtime", { key: "overall", at: "disasters.survivals", label: "stats.survivals", color: "§d" }],
        ],
      },
      { title: "game.sections.more", rows: [["powerups"]] },
      { title: "stats.survivals", cells: at("disasters.survivals", keysOf("disasters.survivals")), sort: "desc", list: true, collapsed: true },
      { title: "stats.deaths", cells: at("disasters.deaths", keysOf("disasters.deaths")), sort: "desc", list: true, collapsed: true },
    ],
  },
  dragonWars: { sections: [{ rows: [["wins", "kills", "mounts"]] }] },
  dropper: {
    sections: [
      {
        rows: [
          ["wins", "fails", "mapsCompleted"],
          ["gamesPlayed", "gamesFinished"],
          [{ key: "bestTime", when: timed, session: false }, { key: "flawlessGames", when: timed }],
        ],
      },
      { title: "game.sections.bestTimes", ...DROPPER_LIST("bestTime"), list: true, collapsed: true, search: true, pairs: true, session: false },
      { title: "game.sections.completions", ...DROPPER_LIST("completions"), list: true, collapsed: true, search: true, pairs: true },
    ],
  },
  enderSpleef: {
    sections: [
      { rows: [["wins", "blocksBroken", "trail"]] },
      { title: "stats.powerupActivations", color: "§b", rows: [["bigShot", "tripleShot", "powerupActivations"]] },
    ],
  },
  farmHunt: {
    sections: [
      { name: "§6Overall", rows: [["wins", "kills", "tauntsUsed", "poopCollected"]] },
      { name: "§6Animal", rows: [["animalWins", "animalKills"]] },
      { name: "§6Hunter", rows: [["hunterWins", "hunterKills"]] },
    ],
  },
  football: { sections: [{ rows: [["wins", "goals"], ["kicks", "powerKicks"]] }] },
  galaxyWars: { sections: [{ rows: [["wins", "rebelKills", "empireKills"], ["kills", "deaths", "kdr"]] }] },
  hideAndSeek: {
    sections: [
      { name: "§6Overall", rows: [at("hideAndSeek.overall", ["wins", "hiderWins", "seekerWins"])] },
      {
        name: "§6Party Pooper",
        rows: [at("hideAndSeek.partyPooper", ["wins", "hiderWins", "seekerWins"]), ["objectivesCompleted", "kills"]],
      },
      { name: "§6Prop Hunt", rows: [at("hideAndSeek.propHunt", ["wins", "hiderWins", "seekerWins"])] },
    ],
  },
  holeInTheWall: { sections: [{ rows: [["wins", "wallsFaced"], [{ key: "highestScoreQualifications", session: false }, { key: "highestScoreFinals", session: false }]] }] },
  hypixelSays: {
    sections: [
      { name: "§6Hypixel Says", rows: [["wins", "roundsWon"], ["points", { key: "maxScore", session: false }]] },
      ...[
        ["hypixelSays.simonSays", "§6Simon Says"],
        ["hypixelSays.santaSays", "§6Santa Says"],
      ].map(([place, name]): SectionSpec => ({ name, box: true, rows: [at(place, ["wins", "roundsWon"]), [...at(place, ["points"]), { key: "maxScore", at: place, session: false }]] })),
    ],
  },
  miniWalls: {
    sections: [{ rows: [["finalKills", "wins", "kit"], ["kills", "deaths", "kdr"], ["witherKills", "witherDamage"]] }],
  },
  partyGames: {
    sections: [
      { rows: [["wins", "roundsWon", "starsEarned"]] },
      { title: "game.sections.bestTimes", cells: PARTY_ROUNDS("BestTime"), list: true, session: false },
      { title: "game.sections.bestScores", cells: PARTY_ROUNDS("BestScore"), list: true, pairs: true, session: false },
      { title: "stats.roundWins", cells: PARTY_ROUNDS("Wins"), list: true, collapsed: true, pairs: true },
    ],
  },
  pixelPainters: { sections: [{ rows: [["wins"]] }] },
  pixelParty: {
    sections: [
      {
        name: "§6Overall",
        rows: [at("pixelParty.overall", ["wins", "losses", "wlr"]), [{ key: "gamesPlayed", at: "pixelParty.overall" }, "roundsCompleted", "powerupsCollected"]],
      },
      ...[
        ["pixelParty.normal", "§eNormal"],
        ["pixelParty.hyper", "§dHyper"],
      ].map(([place, name]) => ({ name, box: true, rows: [at(place, ["wins", "losses", "wlr"]), at(place, ["gamesPlayed"])] })),
    ],
  },
  seasonal: { sections: SEASONAL.map(([place, name, stat]) => ({ name, box: true, rows: [at(place, ["wins", stat])] })) },
  throwOut: { sections: [{ rows: [["wins", "kills", "deaths", "kdr"]] }] },
};

export const ARCADE_PAGE: GameLayout = {
  game: ARCADE,
  // Zombies' maps split its games, so they get a switcher; the other cards' sub-pages are sections.
  modes: ARCADE.modes.getModes().map(({ api, submodes }) =>
    api === "zombies" ? { key: api, submodes: submodes.map(({ api: key, formatted: name }) => ({ key, name })) } : { key: api }),
  overview: ["coins", "coinConversions", "wins"],
  page: (mode, submode) => {
    if (mode === "overall") return OVERALL;
    if (mode === "zombies") return zombies(submode!);
    return PAGES[mode];
  },
  // By wins, which most of its games store, where Overall's list reads them; Seasonal's four games added up, since its
  // own total is `totalWins`.
  mostPlayed: {
    by: "wins",
    place: (mode) => (mode === "seasonal" ? SEASONAL.map(([place]) => place) : MODE_WINS.find(([key]) => key === mode)?.[1] ?? mode),
  },
};
