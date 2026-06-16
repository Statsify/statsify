/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ArcadeChallenges,
  ArenaBrawlChallenges,
  BedWarsChallenges,
  BlitzSGChallenges,
  BuildBattleChallenges,
  ChallengeModes,
  Challenges,
  CopsAndCrimsChallenges,
  DuelsChallenges,
  FormattedGame,
  GameChallenges,
  type GameId,
  type GameMode,
  MegaWallsChallenges,
  MetadataEntry,
  MurderMysteryChallenges,
  PaintballChallenges,
  QuakeChallenges,
  SkyWarsChallenges,
  SmashHeroesChallenges,
  SpeedUHCChallenges,
  TNTGamesChallenges,
  TurboKartRacersChallenges,
  UHCChallenges,
  VampireZChallenges,
  WallsChallenges,
  WarlordsChallenges,
  WoolGamesChallenges,
  scanMetadata,
} from "@statsify/schemas";
import { Container, Footer, GameList, Header, SidebarItem, Table } from "#components";

import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";

export interface ChallengeProfileProps extends BaseProfileProps {
  mode: GameMode<ChallengeModes>;
  gameIcons: Record<GameId, Image>;
}

interface NormalTableProps {
  challenges: Challenges;
  t: LocalizeFunction;
  gameIcons: Record<GameId, Image>;
}

const NormalTable = ({ challenges, t, gameIcons }: NormalTableProps) => {
  const { total, ...challengesByGame } = challenges;
  void total;

  const entries: [GameId, any][] = Object.entries(challengesByGame)
    .sort((a, b) => (b[1]?.total ?? 0) - (a[1]?.total ?? 0))
    .map(([k, v]) => [k as GameId, t(v.total)]);

  return <GameList entries={entries} gameIcons={gameIcons} />;
};

interface GameTableProps {
  gameChallenges: GameChallenges;
  mode: Exclude<GameMode<ChallengeModes>["api"], "overall">;
  t: LocalizeFunction;
}

const METADATA: Record<Exclude<GameMode<ChallengeModes>["api"], "overall">, MetadataEntry[]> = {
  ARCADE: scanMetadata(ArcadeChallenges),
  ARENA_BRAWL: scanMetadata(ArenaBrawlChallenges),
  BEDWARS: scanMetadata(BedWarsChallenges),
  BLITZSG: scanMetadata(BlitzSGChallenges),
  BUILD_BATTLE: scanMetadata(BuildBattleChallenges),
  COPS_AND_CRIMS: scanMetadata(CopsAndCrimsChallenges),
  DUELS: scanMetadata(DuelsChallenges),
  MEGAWALLS: scanMetadata(MegaWallsChallenges),
  MURDER_MYSTERY: scanMetadata(MurderMysteryChallenges),
  PAINTBALL: scanMetadata(PaintballChallenges),
  QUAKE: scanMetadata(QuakeChallenges),
  SKYWARS: scanMetadata(SkyWarsChallenges),
  SMASH_HEROES: scanMetadata(SmashHeroesChallenges),
  SPEED_UHC: scanMetadata(SpeedUHCChallenges),
  TNT_GAMES: scanMetadata(TNTGamesChallenges),
  TURBO_KART_RACERS: scanMetadata(TurboKartRacersChallenges),
  UHC: scanMetadata(UHCChallenges),
  VAMPIREZ: scanMetadata(VampireZChallenges),
  WALLS: scanMetadata(WallsChallenges),
  WARLORDS: scanMetadata(WarlordsChallenges),
  WOOLGAMES: scanMetadata(WoolGamesChallenges),
};

const GameTable = ({ gameChallenges, mode, t }: GameTableProps) => {
  const metadata = METADATA[mode];
  const entries = Object.entries(gameChallenges);

  const GROUP_SIZE = entries.length < 5 ? 4 : (entries.length - 1) ** 0.5;

  const groups = arrayGroup(
    entries
      .filter(([k]) => k !== "total")
      .sort((a, b) => b[1] - a[1])
      .map(([challenge, completions]) => {
        const [, field] = metadata.find(([k]) => k === challenge)!;

        const realName = field.leaderboard?.name ?? prettify(challenge);
        return [realName, t(completions)];
      }),
    GROUP_SIZE
  );

  const colors = ["§a", "§e", "§6", "§c", "§4"];

  return (
    <Table.table>
      {groups.map((g, i) => (
        <Table.tr>
          {g.map((challenge) => (
            <Table.td title={challenge[0]} value={challenge[1]} color={colors[i]} />
          ))}
        </Table.tr>
      ))}
    </Table.table>
  );
};

export const ChallengesProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
  gameIcons,
}: ChallengeProfileProps) => {
  const { challenges } = player.stats;

  const { api, formatted } = mode;
  let table: JSX.Element;

  switch (api) {
    case "overall":
      table = <NormalTable challenges={challenges} t={t} gameIcons={gameIcons} />;
      break;

    default:
      table = (
        <GameTable
          gameChallenges={challenges[api]}
          mode={api}
          t={t}
        />
      );
      break;
  }

  const sidebar: SidebarItem[] = [[t("stats.total"), t(challenges.total), "§b"]];

  if (api !== "overall") {
    sidebar.push([
      t("stats.game-total", { game: formatted }),
      t(challenges[api].total),
      "§a",
    ]);
  }

  const title =
    api in FormattedGame ?
      `§l${FormattedGame[api as keyof typeof FormattedGame]}` :
      formatted;

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l§aChallenges §r(${title}§r)`}
        sidebar={sidebar}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
