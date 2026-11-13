/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AssistsSchema, CoinsSchema, KillsStats, WinsSchema, WinsStats } from "../common.js";
import { type GamePrefix, cycleColors } from "#prefixes";
import { FormattedGame } from "#game";
import type { APIData } from "@statsify/util";
import { formats } from "#definition/format";
import { prefixFields } from "../prefix-fields.js";
import { s } from "#definition/s";

const tntgamesRainbow = (text: string) => cycleColors(text, ["c", "6", "e", "a", "b", "d", "5"]);

// Prefixes for TNT Run, PVP Run and Bow Spleef
const RUN_PREFIXES: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 25 },
  { fmt: (n) => `§f[${n}]`, req: 100 },
  { fmt: (n) => `§2[${n}]`, req: 250 },
  { fmt: (n) => `§a[${n}]`, req: 500 },
  { fmt: (n) => `§9[${n}]`, req: 1000 },
  { fmt: (n) => `§5[${n}]`, req: 2500 },
  { fmt: (n) => `§6[${n}]`, req: 5000 },
  { fmt: (n) => `§c[${n}]`, req: 7500 },
  { fmt: (n) => `§0[${n}]`, req: 10_000 },
  { fmt: (n) => tntgamesRainbow(`[${n}]`), req: 15_000 },
];

// Prefixes for TNT Tag and Wizards
const TAG_PREFIXES: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 15 },
  { fmt: (n) => `§f[${n}]`, req: 50 },
  { fmt: (n) => `§2[${n}]`, req: 100 },
  { fmt: (n) => `§a[${n}]`, req: 250 },
  { fmt: (n) => `§9[${n}]`, req: 500 },
  { fmt: (n) => `§5[${n}]`, req: 1000 },
  { fmt: (n) => `§6[${n}]`, req: 1500 },
  { fmt: (n) => `§c[${n}]`, req: 2500 },
  { fmt: (n) => `§0[${n}]`, req: 5000 },
  { fmt: (n) => tntgamesRainbow(`[${n}]`), req: 10_000 },
];

const runPrefix = prefixFields(RUN_PREFIXES, { abbreviation: false });
const tagPrefix = prefixFields(TAG_PREFIXES, { abbreviation: false });
const wizardsPrefix = prefixFields(TAG_PREFIXES);

const BowSpleefSchema = s.object({
  ...WinsStats,
  hits: s.number().color("§e").leaderboard(false),
  progression() {
    return runPrefix.progression(this.wins);
  },
  currentPrefix() {
    return runPrefix.currentPrefix(this.wins);
  },
  naturalPrefix() {
    return runPrefix.naturalPrefix(this.wins);
  },
  nextPrefix() {
    return runPrefix.nextPrefix(this.wins);
  },
});

export type BowSpleef = s.infer<typeof BowSpleefSchema>;

const PVPRunSchema = s.object({
  wins: WinsSchema.color("§a"),
  ...KillsStats,
  record: s.number().color("§e").format(formats.time),
  progression() {
    return runPrefix.progression(this.wins);
  },
  currentPrefix() {
    return runPrefix.currentPrefix(this.wins);
  },
  naturalPrefix() {
    return runPrefix.naturalPrefix(this.wins);
  },
  nextPrefix() {
    return runPrefix.nextPrefix(this.wins);
  },
});

export type PVPRun = s.infer<typeof PVPRunSchema>;

const TNTRunSchema = s.object({
  ...WinsStats,
  record: s.number().color("§e").format(formats.time),
  potionsSplashed: s.number().color("§5"),
  blocksRan: s.number().color("§b"),
  progression() {
    return runPrefix.progression(this.wins);
  },
  currentPrefix() {
    return runPrefix.currentPrefix(this.wins);
  },
  naturalPrefix() {
    return runPrefix.naturalPrefix(this.wins);
  },
  nextPrefix() {
    return runPrefix.nextPrefix(this.wins);
  },
});

export type TNTRun = s.infer<typeof TNTRunSchema>;

const TNTTagSchema = s.object({
  wins: WinsSchema.color("§a"),
  ...KillsStats,
  tags: s.number().color("§e"),
  powerups: s.number().color("§d").leaderboard({ name: "Power-Ups" }),
  progression() {
    return tagPrefix.progression(this.wins);
  },
  currentPrefix() {
    return tagPrefix.currentPrefix(this.wins);
  },
  naturalPrefix() {
    return tagPrefix.naturalPrefix(this.wins);
  },
  nextPrefix() {
    return tagPrefix.nextPrefix(this.wins);
  },
});

export type TNTTag = s.infer<typeof TNTTagSchema>;

const WizardsClassSchema = s.object({
  ...KillsStats,
  assists: AssistsSchema.color("§e"),
});

export type WizardsClass = s.infer<typeof WizardsClassSchema>;

const WizardsSchema = s.object({
  class: s.string().default("none"),
  wins: WinsSchema.color("§a"),
  ...KillsStats,
  assists: AssistsSchema.color("§e"),
  points: s.number().color("§5"),
  airTime: s.number().color("§b").format(formats.time),
  powerOrbs: s.number().color("§a"),
  progression() {
    return wizardsPrefix.progression(this.wins);
  },
  currentPrefix() {
    return wizardsPrefix.currentPrefix(this.wins);
  },
  naturalPrefix() {
    return wizardsPrefix.naturalPrefix(this.wins);
  },
  nextPrefix() {
    return wizardsPrefix.nextPrefix(this.wins);
  },
  fireWizard: WizardsClassSchema,
  iceWizard: WizardsClassSchema,
  witherWizard: WizardsClassSchema,
  kineticWizard: WizardsClassSchema,
  bloodWizard: WizardsClassSchema,
  toxicWizard: WizardsClassSchema,
  hydroWizard: WizardsClassSchema,
  ancientWizard: WizardsClassSchema,
  stormWizard: WizardsClassSchema,
  arcaneWizard: WizardsClassSchema,
});

export type Wizards = s.infer<typeof WizardsSchema>;

export const TNTGamesSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    wins: WinsSchema.color("§e"),
    tntRun: TNTRunSchema.leaderboard((tntRun) => ({
      fieldName: "TNT Run",
      extraDisplay: tntRun.naturalPrefix,
    })),
    pvpRun: PVPRunSchema.leaderboard((pvpRun) => ({
      fieldName: "PVP Run",
      extraDisplay: pvpRun.naturalPrefix,
    })),
    bowSpleef: BowSpleefSchema.leaderboard((bowSpleef) => ({
      extraDisplay: bowSpleef.naturalPrefix,
    })),
    wizards: WizardsSchema.leaderboard((wizards) => ({ extraDisplay: wizards.naturalPrefix })),
    tntTag: TNTTagSchema.leaderboard((tntTag) => ({
      fieldName: "TNT Tag",
      extraDisplay: tntTag.naturalPrefix,
    })),
  })
  .leaderboard({ fieldName: `${FormattedGame.TNT_GAMES} -` });

export type TNTGames = s.infer<typeof TNTGamesSchema>;

function wizardsClass(data: APIData, clazz: string): s.input<typeof WizardsClassSchema> {
  return {
    kills: data[`${clazz}_kills`],
    deaths: data[`${clazz}_deaths`],
    assists: data[`${clazz}_assists`],
  };
}

function wizards(data: APIData, ap: APIData): s.input<typeof WizardsSchema> {
  return {
    // Hypixel doesn't capitalize the word "Wizard" so the class name can't be pretty printed
    class: (data.wizards_selected_class ?? "none").replace("new_", "").replace("wizard", "Wizard"),
    wins: data.wins_capture,
    kills: data.kills_capture,
    deaths: data.deaths_capture,
    assists: data.assists_capture,
    points: data.points_capture,
    // air_time_capture is in ticks of 50ms
    airTime: (data.air_time_capture ?? 0) * 50,
    powerOrbs: ap.tntgames_power_hungry,
    fireWizard: wizardsClass(data, "new_firewizard"),
    iceWizard: wizardsClass(data, "new_icewizard"),
    witherWizard: wizardsClass(data, "new_witherwizard"),
    kineticWizard: wizardsClass(data, "new_kineticwizard"),
    bloodWizard: wizardsClass(data, "new_bloodwizard"),
    toxicWizard: wizardsClass(data, "new_toxicwizard"),
    hydroWizard: wizardsClass(data, "new_hydrowizard"),
    ancientWizard: wizardsClass(data, "new_ancientwizard"),
    stormWizard: wizardsClass(data, "new_stormwizard"),
    arcaneWizard: wizardsClass(data, "arcane_wizard"),
  };
}

export function tntGames(data: APIData = {}, ap: APIData = {}): s.input<typeof TNTGamesSchema> {
  return {
    coins: data.coins,
    wins: data.wins,
    tntRun: {
      wins: data.wins_tntrun,
      losses: data.deaths_tntrun,
      record: (data.record_tntrun ?? 0) * 1000,
      potionsSplashed: data.run_potions_splashed_on_players,
      blocksRan: ap.tntgames_block_runner,
    },
    pvpRun: {
      wins: data.wins_pvprun,
      kills: data.kills_pvprun,
      deaths: data.deaths_pvprun,
      record: (data.record_pvprun ?? 0) * 1000,
    },
    bowSpleef: {
      wins: data.wins_bowspleef,
      losses: data.deaths_bowspleef,
      hits: data.tags_bowspleef,
    },
    wizards: wizards(data, ap),
    tntTag: {
      wins: data.wins_tntag,
      kills: data.kills_tntag,
      deaths: data.deaths_tntag,
      tags: ap.tntgames_clinic,
      powerups: ap.tntgames_the_upper_hand,
    },
  };
}
