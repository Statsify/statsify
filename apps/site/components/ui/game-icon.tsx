/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import ARCADE from "~/public/games/ARCADE.png";
import ARENA_BRAWL from "~/public/games/ARENA_BRAWL.png";
import BEDWARS from "~/public/games/BEDWARS.png";
import BLITZSG from "~/public/games/BLITZSG.png";
import BUILD_BATTLE from "~/public/games/BUILD_BATTLE.png";
import CLASSIC from "~/public/games/CLASSIC.png";
import COPS_AND_CRIMS from "~/public/games/COPS_AND_CRIMS.png";
import CRAZY_WALLS from "~/public/games/CRAZY_WALLS.png";
import DUELS from "~/public/games/DUELS.png";
import HOUSING from "~/public/games/HOUSING.png";
import Image from "next/image";
import MAIN_LOBBY from "~/public/games/MAIN_LOBBY.png";
import MEGAWALLS from "~/public/games/MEGAWALLS.png";
import MURDER_MYSTERY from "~/public/games/MURDER_MYSTERY.png";
import PAINTBALL from "~/public/games/PAINTBALL.png";
import PIT from "~/public/games/PIT.png";
import PROTOTYPE from "~/public/games/PROTOTYPE.png";
import QUAKE from "~/public/games/QUAKE.png";
import REPLAY from "~/public/games/REPLAY.png";
import SKYBLOCK from "~/public/games/SKYBLOCK.png";
import SKYCLASH from "~/public/games/SKYCLASH.png";
import SKYWARS from "~/public/games/SKYWARS.png";
import SMASH_HEROES from "~/public/games/SMASH_HEROES.png";
import SMP from "~/public/games/SMP.png";
import SPEED_UHC from "~/public/games/SPEED_UHC.png";
import TNT_GAMES from "~/public/games/TNT_GAMES.png";
import TOURNAMENT_LOBBY from "~/public/games/TOURNAMENT_LOBBY.png";
import TURBO_KART_RACERS from "~/public/games/TURBO_KART_RACERS.png";
import UHC from "~/public/games/UHC.png";
import VAMPIREZ from "~/public/games/VAMPIREZ.png";
import WALLS from "~/public/games/WALLS.png";
import WARLORDS from "~/public/games/WARLORDS.png";
import WOOLGAMES from "~/public/games/WOOLGAMES.png";
import type { GameCode } from "@statsify/schemas";

const GameIcons = {
  ARCADE,
  ARENA_BRAWL,
  BEDWARS,
  BLITZSG,
  BUILD_BATTLE,
  CLASSIC,
  COPS_AND_CRIMS,
  CRAZY_WALLS,
  DUELS,
  HOUSING,
  MAIN_LOBBY,
  MEGAWALLS,
  MURDER_MYSTERY,
  PAINTBALL,
  PIT,
  PROTOTYPE,
  QUAKE,
  REPLAY,
  SKYBLOCK,
  SKYCLASH,
  SKYWARS,
  SMASH_HEROES,
  SMP,
  SPEED_UHC,
  TNT_GAMES,
  TOURNAMENT_LOBBY,
  TURBO_KART_RACERS,
  UHC,
  VAMPIREZ,
  WALLS,
  WARLORDS,
  WOOLGAMES,
};

export function GameIcon({ game }: { game: GameCode }) {
  if (!(game in GameIcons)) throw new Error(`Unsupported GameIcon ${game}`);

  return (
    <Image
      src={GameIcons[game as keyof typeof GameIcons]}
      width={32}
      height={32}
      alt={game.toLowerCase()}
    />
  );
}
