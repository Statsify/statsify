/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArcadeModes, FormattedGame, GameMode } from "@statsify/schemas";
import { BaseProfileProps } from "commands/base.hypixel-command";
import {
  BlockingDeadTable,
  BountyHuntersTable,
  CaptureTheWoolTable,
  CreeperAttackTable,
  DragonWarsTable,
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
  SeasonalTable,
  ThrowOutTable,
  ZombiesTable,
} from "./tables";
import { Container, Footer, Header, SidebarItem } from "#components";

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
    [t("stats.overallWins"), t(arcade.wins), "§b"],
    [t("stats.stampLevel"), t(arcade.stampLevel), "§a"],
  ];

  const { api } = mode;
  let table: JSX.Element;

  switch (api) {
    case "blockingDead":
      table = <BlockingDeadTable stats={arcade[api]} t={t} />;
      break;
    case "bountyHunters":
      table = <BountyHuntersTable stats={arcade[api]} t={t} />;
      break;
    case "captureTheWool":
      table = <CaptureTheWoolTable stats={arcade[api]} t={t} />;
      break;
    case "creeperAttack":
      table = <CreeperAttackTable stats={arcade[api]} t={t} />;
      break;
    case "dragonWars":
      table = <DragonWarsTable stats={arcade[api]} t={t} />;
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
      table = <PartyGamesTable stats={arcade[api]} t={t} />;
      break;
    case "pixelPainters":
      table = <PixelPaintersTable stats={arcade[api]} t={t} />;
      break;
    case "seasonal":
      table = <SeasonalTable stats={arcade[api]} t={t} />;
      break;
    case "throwOut":
      table = <ThrowOutTable stats={arcade[api]} t={t} />;
      break;
    case "zombies":
      table = <ZombiesTable stats={arcade[api]} t={t} time={time} />;
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
        } §r(${mode.formatted})`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
