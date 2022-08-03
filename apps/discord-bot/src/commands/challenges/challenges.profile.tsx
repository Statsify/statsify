/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "commands/base.hypixel-command";
import {
  ChallengeModes,
  Challenges,
  FormattedGame,
  GameMode,
  MetadataScanner,
} from "@statsify/schemas";
import { Container, Footer, Header, Table } from "#components";
import { GameChallenges } from "@statsify/schemas/src/GameChallenges";
import { LocalizeFunction } from "@statsify/discord";
import { arrayGroup, prettify } from "@statsify/util";

export interface ChallengeProfileProps extends BaseProfileProps {
  mode: GameMode<ChallengeModes>;
}

interface NormalTableProps {
  challenges: Challenges;
  t: LocalizeFunction;
}

const NormalTable = ({ challenges, t }: NormalTableProps) => {
  const rowSize = 4;

  const games = Object.entries(challenges).map(([game, challengeGame]) => [
    FormattedGame[game as keyof typeof FormattedGame],
    challengeGame.total,
  ]);

  games.sort((a, b) => b[1].total - a[1].total);

  const rows = arrayGroup(games, rowSize);

  const colors = ["§a", "§e", "§6", "§c"];

  return (
    <Table.table>
      {rows.map((row, index) => (
        <Table.tr>
          {row.map((game) => (
            <Table.td title={game[0]} value={t(game[1].total)} color={colors[index]} />
          ))}
        </Table.tr>
      ))}
    </Table.table>
  );
};

interface GameTableProps {
  gameChallenges: GameChallenges;
  constructor: any;
  t: LocalizeFunction;
}

const GameTable = ({ gameChallenges, constructor, t }: GameTableProps) => {
  const rowSize = 4;

  const metadata = MetadataScanner.scan(constructor);

  const games: [string, number][] = Object.entries(gameChallenges).map(
    ([challenge, completions]) => {
      const field = metadata.find(([k]) => k === challenge);
      const realname = field?.[1]?.leaderboard?.name ?? prettify(challenge);
      return [prettify(realname), completions];
    }
  );

  games.sort((a, b) => b[1] - a[1]);

  const rows = [...arrayGroup(games, rowSize)];

  const colors = ["§a", "§e", "§6", "§c"];

  return (
    <Table.table>
      {rows.map((row, index) => (
        <Table.tr>
          {row.map((challenge) => (
            <Table.td
              title={challenge[0]}
              value={t(challenge[1])}
              color={colors[index]}
            />
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
}: ChallengeProfileProps) => {
  const { challenges } = player;

  const { api } = mode;
  let table: JSX.Element;

  switch (api) {
    case "overall":
      table = <NormalTable challenges={challenges} t={t} />;
      break;
    default:
      table = (
        <GameTable
          gameChallenges={challenges[api]}
          constructor={typeof challenges[api]}
          t={t}
        />
      );
      break;
  }

  const total = Object.entries(challenges).reduce(
    (p, c) => (c[1]?.total ? p + c[1].total : p),
    0
  );

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§lChallenges`}
        description={`Total ${total}`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
