/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, prettify } from "@statsify/util";
import { AssistsSchema, CoinsSchema, KillsStats, WinsStats } from "../common.js";
import { FormattedGame } from "#game";
import {
  type GameTitle,
  createPrefixProgression,
  cycleColors,
  defaultPrefix,
  getFormattedPrefix,
} from "#prefixes";
import { ProgressionSchema } from "../../../progression.definition.js";
import { add, sub } from "@statsify/math";
import { s } from "#definition/s";

const warlordsRainbow = (text: string) => cycleColors(text, ["c", "6", "e", "a", "2", "b", "d", "9"]);

const titles: GameTitle[] = [
  { req: 0, fmt: (n) => `§8${n}`, title: "Rookie" },
  { req: 5, fmt: (n) => `§7${n}`, title: "Recruit" },
  { req: 25, fmt: (n) => `§e${n}`, title: "Novice" },
  { req: 50, fmt: (n) => `§a${n}`, title: "Apprentice" },
  { req: 125, fmt: (n) => `§2${n}`, title: "Soldier" },
  { req: 250, fmt: (n) => `§b${n}`, title: "Captain" },
  { req: 500, fmt: (n) => `§9${n}`, title: "General" },
  { req: 1000, fmt: (n) => `§d${n}`, title: "Vanquisher" },
  { req: 2500, fmt: (n) => `§5${n}`, title: "Gladiator" },
  { req: 5000, fmt: (n) => `§c${n}`, title: "Champion" },
  { req: 7500, fmt: (n) => `§6${n}`, title: "Warlord" },
  { req: 10_000, fmt: (n) => `§l${warlordsRainbow(n)}`, title: "Overlord" },
];

/** Each class's attack, defense and healer specifications */
const CLASSES = {
  mage: ["pyromancer", "cryomancer", "aquamancer"],
  warrior: ["berserker", "defender", "revenant"],
  paladin: ["avenger", "crusader", "protector"],
  shaman: ["thunderlord", "spiritguard", "earthwarden"],
} as const;

type WarlordsClass = keyof typeof CLASSES;

const SpecificationStats = s.fields({
  wins: s.number().color("§e").leaderboard({ limit: 500_000 }),
  damage: s.number().color("§c"),
  prevent: s.number().color("§b"),
  healing: s.number().color("§a"),
  total: s.number().color("§6").leaderboard(false),
});

const WarlordsSpecificationSchema = s.object(SpecificationStats);

const warlordsClassSchema = ([attack, defense, healer]: readonly string[]) =>
  s.object({
    ...SpecificationStats,
    specification: s.string().default("none"),
    level: s.number().color("§a").leaderboard(false),
    attack: WarlordsSpecificationSchema.leaderboard({ name: prettify(attack) }),
    defense: WarlordsSpecificationSchema.leaderboard({ name: prettify(defense) }),
    healer: WarlordsSpecificationSchema.leaderboard({ name: prettify(healer) }),
  });

type WarlordsClassSchema = ReturnType<typeof warlordsClassSchema>;

const WarlordsDominationSchema = s.object({
  capturePoints: s.number().color("§2"),
  defendPoints: s.number().color("§b"),
  kills: s.number().color("§e").leaderboard({ limit: 500_000 }),
  score: s.number().color("§6"),
  wins: s.number().color("§a").leaderboard({ limit: 500_000 }),
});

const WarlordsCaptureTheFlagSchema = s.object({
  wins: s.number().color("§a").leaderboard({ limit: 500_000 }),
  kills: s.number().color("§e").leaderboard({ limit: 500_000 }),
  flagCaptures: s.number().color("§c"),
  flagReturns: s.number().color("§9"),
});

const WarlordsTeamDeathmatchSchema = s.object({
  wins: s.number().color("§a").leaderboard({ limit: 500_000 }),
  kills: s.number().color("§e").leaderboard({ limit: 500_000 }),
});

export const WarlordsSchema = s
  .object({
    class: s.string().default("warrior"),
    coins: CoinsSchema.color("§6"),
    titleFormatted() {
      return s
        .string()
        .computed((score) => getFormattedPrefix({ prefixes: titles, score }), [this.wins])
        .default(defaultPrefix(titles));
    },
    progression() {
      return ProgressionSchema.computed((wins) => createPrefixProgression(titles, wins), [this.wins]);
    },
    nextTitleFormatted() {
      return s
        .string()
        .computed((score) => getFormattedPrefix({ prefixes: titles, score, skip: true }), [
          this.wins,
        ]);
    },
    mage: warlordsClassSchema(CLASSES.mage),
    warrior: warlordsClassSchema(CLASSES.warrior),
    paladin: warlordsClassSchema(CLASSES.paladin),
    shaman: warlordsClassSchema(CLASSES.shaman),
    domination: WarlordsDominationSchema,
    captureTheFlag: WarlordsCaptureTheFlagSchema,
    teamDeathmatch: WarlordsTeamDeathmatchSchema,
    gamesPlayed: s.number().color("§e"),
    ...WinsStats,
    ...KillsStats,
    assists: AssistsSchema.color("§e"),
  })
  .leaderboard((warlords) => ({
    fieldName: FormattedGame.WARLORDS,
    extraDisplay: warlords.titleFormatted,
  }));

export type Warlords = s.infer<typeof WarlordsSchema>;

function specification(
  data: APIData,
  mode: string
): s.input<typeof WarlordsSpecificationSchema> {
  const damage = data[`damage_${mode}`];
  const prevent = data[`damage_prevented_${mode}`];
  const healing = data[`heal_${mode}`];

  return {
    wins: data[`wins_${mode}`],
    damage,
    prevent,
    healing,
    total: add(damage, prevent, healing),
  };
}

const UPGRADES = [
  "cooldown",
  "critchance",
  "critmultiplier",
  "energy",
  "health",
  "skill1",
  "skill2",
  "skill3",
  "skill4",
  "skill5",
];

function warlordsClass(data: APIData, clazz: WarlordsClass): s.input<WarlordsClassSchema> {
  const [attack, defense, healer] = CLASSES[clazz];

  return {
    ...specification(data, clazz),
    specification: data[`${clazz}_spec`] ?? "none",
    level: add(...UPGRADES.map((upgrade) => data[`${clazz}_${upgrade}`])),
    attack: specification(data, attack),
    defense: specification(data, defense),
    healer: specification(data, healer),
  };
}

export function warlords(data: APIData = {}): s.input<typeof WarlordsSchema> {
  const classes = Object.entries(CLASSES).flatMap(([clazz, specifications]) => [
    clazz,
    ...specifications,
  ]);

  const gamesPlayed = Math.ceil(add(...classes.map((clazz) => data[`${clazz}_plays`])) / 2);

  return {
    class: data.chosen_class || "warrior",
    coins: data.coins,
    mage: warlordsClass(data, "mage"),
    warrior: warlordsClass(data, "warrior"),
    paladin: warlordsClass(data, "paladin"),
    shaman: warlordsClass(data, "shaman"),
    domination: {
      capturePoints: data.dom_point_captures,
      defendPoints: data.dom_point_defends,
      kills: data.kills_domination,
      score: data.total_domination_score,
      wins: data.wins_domination,
    },
    captureTheFlag: {
      wins: data.wins_capturetheflag,
      kills: data.kills_capturetheflag,
      flagCaptures: data.flag_conquer_self,
      flagReturns: data.flag_returns,
    },
    teamDeathmatch: {
      wins: data.wins_teamdeathmatch,
      kills: data.kills_teamdeathmatch,
    },
    gamesPlayed,
    wins: data.wins,
    // Hypixel's losses are only about 90% accurate
    // https://hypixel.net/threads/warlords-skillrating-website.1560046/post-12210896
    losses: sub(gamesPlayed, data.wins),
    kills: data.kills,
    deaths: data.deaths,
    assists: data.assists,
  };
}
