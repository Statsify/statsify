/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArcadeModes, FormattedGame, type GameMode } from "@statsify/schemas";
import {
  BlockingDeadTable,
  BountyHuntersTable,
  CreeperAttackTable,
  DragonWarsTable,
  DropperTable,
  EnderSpleefTable,
  FarmHuntTable,
  FootballTable,
  GalaxyWarsTable,
  HideAndSeekTable,
  HoleInTheWallTable,
  HypixelSaysTable,
  MiniWallsTable,
  OverallArcadeTable,
  PartyGamesTable,
  PixelPaintersTable,
  PixelPartyTable,
  SeasonalTable,
  ThrowOutTable,
  ZombiesMapTable,
  ZombiesTable,
} from "./modes/index.js";
import { Container, Footer, Header, SidebarItem } from "#components";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface ArcadeProfileProps extends BaseProfileProps {
  mode: GameMode<ArcadeModes>;
}

export const ArcadeProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: ArcadeProfileProps) => {
  const { arcade } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(arcade.coins), "§6"],
    [t("stats.coinConversions"), t(arcade.coinConversions), "§e"],
    [t("stats.arcadeWins"), t(arcade.wins), "§b"],
  ];

  const { api, submode } = mode;
  let table: JSX.Element;

  switch (api) {
    case "blockingDead":
      table = <BlockingDeadTable stats={arcade[api]} t={t} />;
      break;

    case "bountyHunters":
      table = <BountyHuntersTable stats={arcade[api]} t={t} />;
      break;

    case "creeperAttack":
      table = <CreeperAttackTable stats={arcade[api]} t={t} />;
      break;

    case "dragonWars":
      table = <DragonWarsTable stats={arcade[api]} t={t} />;
      break;

    case "dropper":
      table = <DropperTable stats={arcade[api]} t={t} time={time} submode={mode.submode} />;
      break;

    case "enderSpleef":
      table = <EnderSpleefTable stats={arcade[api]} t={t} />;
      break;

    case "farmHunt":
      table = <FarmHuntTable stats={arcade[api]} t={t} />;
      break;

    case "football":
      table = <FootballTable stats={arcade[api]} t={t} />;
      break;

    case "galaxyWars":
      table = <GalaxyWarsTable stats={arcade[api]} t={t} />;
      break;

    case "hideAndSeek":
      table = <HideAndSeekTable stats={arcade[api]} t={t} />;
      break;

    case "holeInTheWall":
      table = <HoleInTheWallTable stats={arcade[api]} t={t} time={time} />;
      break;

    case "hypixelSays":
      table = <HypixelSaysTable stats={arcade[api]} t={t} />;
      break;

    case "miniWalls":
      table = <MiniWallsTable stats={arcade[api]} t={t} />;
      break;

    case "partyGames":
      table = <PartyGamesTable stats={arcade[api]} t={t} submode={mode.submode} time={time} />;
      break;

    case "pixelPainters":
      table = <PixelPaintersTable stats={arcade[api]} t={t} />;
      break;

    case "pixelParty":
      table = <PixelPartyTable stats={arcade[api]} t={t} />;
      break;

    case "seasonal":
      table = <SeasonalTable stats={arcade[api]} t={t} />;
      break;

    case "throwOut":
      table = <ThrowOutTable stats={arcade[api]} t={t} />;
      break;

    case "zombies":
      table = submode.api === "overall" ?
        <ZombiesTable stats={arcade[api]} t={t} time={time} /> :
        <ZombiesMapTable stats={arcade[api]} map={submode.api} t={t} time={time} />;
      break;

    default:
      table = <OverallArcadeTable stats={arcade} t={t} />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.ARCADE} §f${
          api === "overall" ? t("stats.wins") : "Stats"
        } §r(${mode.formatted}${mode.submode ? ` ${mode.submode.formatted}` : ""})`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
