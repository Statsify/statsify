/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ChallengeModes,
  type Challenges,
  ChallengesSchema,
  FormattedGame,
  type GameId,
  type GameMode,
  getField,
} from "@statsify/schemas";
import { Container, Footer, GameList, Header, SidebarItem, Table } from "#components";

import { arrayGroup } from "@statsify/util";
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

type GameChallengesMode = Exclude<GameMode<ChallengeModes>["api"], "overall">;

interface GameTableProps {
  gameChallenges: Challenges[GameChallengesMode];
  mode: GameChallengesMode;
  t: LocalizeFunction;
}

const GameTable = ({ gameChallenges, mode, t }: GameTableProps) => {
  const schema = ChallengesSchema.definition[mode];
  const entries = Object.entries(gameChallenges);

  const GROUP_SIZE = entries.length < 5 ? 4 : (entries.length - 1) ** 0.5;

  const groups = arrayGroup(
    entries
      .filter(([k]) => k !== "total")
      .sort((a, b) => b[1] - a[1])
      .map(([challenge, completions]) => [getField(schema, challenge)!.leaderboard.name, t(completions)]),
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
