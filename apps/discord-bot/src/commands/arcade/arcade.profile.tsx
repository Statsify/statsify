/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArcadeModes, FormattedGame } from "@statsify/schemas";
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
import { prettify } from "@statsify/util";

export interface ArcadeProfileProps extends BaseProfileProps {
  mode: ArcadeModes[number];
}

export const ArcadeProfile = ({
  skin,
  player,
  background,
  logo,
  tier,
  badge,
  mode,
  t,
  time,
}: ArcadeProfileProps) => {
  const { arcade } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(arcade.coins), "§6"],
    [t("stats.overallWins"), t(arcade.wins), "§b"],
  ];

  let table: JSX.Element;

  switch (mode) {
    case "blockingDead":
      table = <BlockingDeadTable stats={arcade[mode]} t={t} />;
      break;
    case "bountyHunters":
      table = <BountyHuntersTable stats={arcade[mode]} t={t} />;
      break;
    case "captureTheWool":
      table = <CaptureTheWoolTable stats={arcade[mode]} t={t} />;
      break;
    case "creeperAttack":
      table = <CreeperAttackTable stats={arcade[mode]} t={t} />;
      break;
    case "dragonWars":
      table = <DragonWarsTable stats={arcade[mode]} t={t} />;
      break;
    case "enderSpleef":
      table = <EnderSpleefTable stats={arcade[mode]} t={t} />;
      break;
    case "farmHunt":
      table = <FarmHuntTable stats={arcade[mode]} t={t} />;
      break;
    case "football":
      table = <FootballTable stats={arcade[mode]} t={t} />;
      break;
    case "galaxyWars":
      table = <GalaxyWarsTable stats={arcade[mode]} t={t} />;
      break;
    case "hideAndSeek":
      table = <HideAndSeekTable stats={arcade[mode]} t={t} />;
      break;
    case "holeInTheWall":
      table = <HoleInTheWallTable stats={arcade[mode]} t={t} />;
      break;
    case "hypixelSays":
      table = <HypixelSaysTable stats={arcade[mode]} t={t} />;
      break;
    case "miniWalls":
      table = <MiniWallsTable stats={arcade[mode]} t={t} />;
      break;
    case "partyGames":
      table = <PartyGamesTable stats={arcade[mode]} t={t} />;
      break;
    case "pixelPainters":
      table = <PixelPaintersTable stats={arcade[mode]} t={t} />;
      break;
    case "seasonal":
      table = <SeasonalTable stats={arcade[mode]} t={t} />;
      break;
    case "throwOut":
      table = <ThrowOutTable stats={arcade[mode]} t={t} />;
      break;
    case "zombies":
      table = <ZombiesTable stats={arcade[mode]} t={t} />;
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
        title={`§l${FormattedGame.ARCADE} §fStats §r(${prettify(mode)})`}
        time={time}
      />
      {table}
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
