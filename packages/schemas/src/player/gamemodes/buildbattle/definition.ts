/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, minecraftColors } from "@statsify/util";
import { CoinsSchema, WinsSchema } from "../common.js";
import { FormattedGame } from "#game";
import { type GameTitle, defaultPrefix, getFormattedPrefix } from "#prefixes";
import { prefixProgression } from "../prefix-fields.js";
import { s } from "#definition/s";

const titles: GameTitle[] = [
  { req: 0, fmt: (n) => `§f${n}`, title: "Rookie" },
  { req: 100, fmt: (n) => `§7${n}`, title: "Untrained" },
  { req: 250, fmt: (n) => `§8${n}`, title: "Amateur" },
  { req: 500, fmt: (n) => `§a${n}`, title: "Prospect" },
  { req: 1000, fmt: (n) => `§2${n}`, title: "Apprentice" },
  { req: 2000, fmt: (n) => `§b${n}`, title: "Experienced" },
  { req: 3500, fmt: (n) => `§3${n}`, title: "Seasoned" },
  { req: 5000, fmt: (n) => `§9${n}`, title: "Trained" },
  { req: 7500, fmt: (n) => `§1${n}`, title: "Skilled" },
  { req: 10_000, fmt: (n) => `§5${n}`, title: "Talented" },
  { req: 15_000, fmt: (n) => `§d${n}`, title: "Professional" },
  { req: 20_000, fmt: (n) => `§c${n}`, title: "Artisan" },
  { req: 30_000, fmt: (n) => `§4${n}`, title: "Expert" },
  { req: 50_000, fmt: (n) => `§6${n}`, title: "Master" },
  { req: 100_000, fmt: (n) => `§l§a${n}`, title: "Legend" },
  { req: 200_000, fmt: (n) => `§l§b${n}`, title: "Grandmaster" },
  { req: 300_000, fmt: (n) => `§l§d${n}`, title: "Celestial" },
  { req: 400_000, fmt: (n) => `§l§c${n}`, title: "Divine" },
  { req: 500_000, fmt: (n) => `§l§6${n}`, title: "Ascended" },
];

const EMBLEM_MAP: Record<string, string> = {
  REMINISCENCE: "≈",
  ALPHA: "α",
  OMEGA: "Ω",
  RICH: "$",
  PODIUM: "π",
  FLORIN: "ƒ",
};

const formatTitle = (score: number) => getFormattedPrefix({ prefixes: titles, score });

const WHITE = minecraftColors.find((c) => c.id === "WHITE")!;

const formatEmblem = (selectedColor: string, selectedIcon: string) => {
  const { code } =
    minecraftColors.find((c) => c.code === selectedColor || c.hex === selectedColor || c.id === selectedColor) ??
    WHITE;

  const icon = EMBLEM_MAP[selectedIcon];

  return `${code}${icon ?? ""}${icon ? " " : ""}`;
};

const BuildBattleModeSchema = s.object({
  wins: WinsSchema.color("§a"),
});

const BuildBattleSpeedBuildersSchema = s.object({
  wins: WinsSchema.color("§a"),
  perfectBuilds: s.number().color("§e"),
});

/** Hypixel's `emblem` object */
const EmblemSchema = s.object({
  selectedColor: s.string(),
  selectedIcon: s.string(),
});

export const BuildBattleSchema = s
  .object({
    overall: BuildBattleModeSchema,
    solo: BuildBattleModeSchema,
    teams: BuildBattleModeSchema,
    pro: BuildBattleModeSchema,
    guessTheBuild: BuildBattleModeSchema,
    speedBuilders: BuildBattleSpeedBuildersSchema,
    coins: CoinsSchema.color("§6"),
    score: s.number().color("§a"),
    correctGuesses: s.number().color("§9"),
    votes: s.number().color("§c"),
    superVotes: s.number().color("§b"),
    emblem: EmblemSchema,
    titleFormatted() {
      return s
        .string()
        .computed(
          (selectedColor, selectedIcon, score) =>
            `${formatEmblem(selectedColor, selectedIcon)}${formatTitle(score)}`,
          [this.emblem.selectedColor, this.emblem.selectedIcon, this.score]
        )
        .default(defaultPrefix(titles));
    },
    naturalTitleFormatted() {
      return s.string().computed(formatTitle, [this.score]).default(defaultPrefix(titles));
    },
    nextTitleFormatted() {
      return s
        .string()
        .computed((score) => getFormattedPrefix({ prefixes: titles, score, skip: true }), [
          this.score,
        ]);
    },
    progression() {
      return prefixProgression(titles, this.score);
    },
  })
  .leaderboard((buildbattle) => ({
    fieldName: FormattedGame.BUILD_BATTLE,
    extraDisplay: buildbattle.titleFormatted,
  }));

export type BuildBattle = s.infer<typeof BuildBattleSchema>;

export function buildBattle(
  data: APIData = {},
  achievements: APIData = {}
): s.input<typeof BuildBattleSchema> {
  return {
    overall: { wins: data.wins },
    solo: { wins: data.wins_solo_normal },
    teams: { wins: data.wins_teams_normal },
    pro: { wins: data.wins_solo_pro },
    guessTheBuild: { wins: data.wins_guess_the_build },
    speedBuilders: {
      wins: data.wins_speed_builders,
      perfectBuilds: achievements.buildbattle_speed_builders_perfectionist,
    },
    coins: data.coins,
    score: data.score,
    correctGuesses: data.correct_guesses,
    votes: data.total_votes,
    superVotes: data.super_votes,
    emblem: {
      selectedColor: data.emblem?.selected_color,
      selectedIcon: data.emblem?.selected_icon,
    },
  };
}
