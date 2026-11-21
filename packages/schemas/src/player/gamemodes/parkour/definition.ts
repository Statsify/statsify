/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import type { APIData } from "@statsify/util";
import { formats } from "#definition/format";
import { s } from "#definition/s";

export const PARKOUR_MODES = new GameModes([{ api: "overall" }] as const);

export type ParkourModes = ExtractGameModes<typeof PARKOUR_MODES>;

const time = (name: string) =>
  s.number().format(formats.time).leaderboard({ sort: "ASC", fieldName: "Time", name });

const lobby = (game: string) => time(`${game} Lobby`);

export const ParkourSchema = s
  .object({
    ARCADE: lobby(FormattedGame.ARCADE),
    BEDWARS: lobby(FormattedGame.BEDWARS),
    BLITZSG: lobby(FormattedGame.BLITZSG),
    BUILD_BATTLE: lobby(FormattedGame.BUILD_BATTLE),
    CLASSIC: lobby(FormattedGame.CLASSIC),
    COPS_AND_CRIMS: lobby(FormattedGame.COPS_AND_CRIMS),
    DUELS: lobby(FormattedGame.DUELS),
    HOUSING: lobby(FormattedGame.HOUSING),
    MAIN_LOBBY: time(FormattedGame.MAIN_LOBBY),
    MEGAWALLS: lobby(FormattedGame.MEGAWALLS),
    MURDER_MYSTERY: lobby(FormattedGame.MURDER_MYSTERY),
    PROTOTYPE: lobby(FormattedGame.PROTOTYPE),
    SKYWARS: lobby(FormattedGame.SKYWARS),
    SMASH_HEROES: lobby(FormattedGame.SMASH_HEROES),
    TNT_GAMES: lobby(FormattedGame.TNT_GAMES),
    TOURNAMENT_LOBBY: time(FormattedGame.TOURNAMENT_LOBBY),
    UHC: lobby(FormattedGame.UHC),
    WARLORDS: lobby(FormattedGame.WARLORDS),
    WOOLGAMES: lobby(FormattedGame.WOOLGAMES),
  })
  .leaderboard({ fieldName: `${FormattedGame.PARKOUR} -` });

export type Parkour = s.infer<typeof ParkourSchema>;

export function parkour(data: APIData = {}): s.input<typeof ParkourSchema> {
  const getTime = (key: string): number =>
    data[key]?.reduce?.(
      (best: number | undefined, { timeTook }: APIData) =>
        best === undefined || timeTook < best ? timeTook : best,
      undefined
    );

  return {
    ARCADE: getTime("ArcadeGames2"),
    BEDWARS: getTime("BedwarsSpring2023"),
    BLITZSG: getTime("BlitzLobby"),
    BUILD_BATTLE: getTime("BuildBattle"),
    CLASSIC: getTime("Legacy"),
    COPS_AND_CRIMS: getTime("CopsnCrims2024"),
    DUELS: getTime("Duels"),
    HOUSING: getTime("Housing"),
    MAIN_LOBBY: getTime("mainLobby2022"),
    MEGAWALLS: getTime("MegaWalls"),
    MURDER_MYSTERY: getTime("MurderMystery"),
    PROTOTYPE: getTime("Prototype"),
    SKYWARS: getTime("SkywarsStandard2022"),
    SMASH_HEROES: getTime("SuperSmash"),
    TNT_GAMES: getTime("tntLobby2024"),
    TOURNAMENT_LOBBY: getTime("Tourney"),
    UHC: getTime("uhc"),
    WARLORDS: getTime("Warlords"),
    WOOLGAMES: getTime("WoolGames"),
  };
}
