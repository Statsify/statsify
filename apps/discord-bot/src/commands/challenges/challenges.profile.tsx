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
  GameId,
  GameMode,
  MetadataScanner,
} from "@statsify/schemas";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { GameChallenges } from "@statsify/schemas/src/GameChallenges";
import { Image } from "skia-canvas";
import { LocalizeFunction } from "@statsify/discord";
import { arrayGroup, prettify, removeFormatting } from "@statsify/util";

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
  const ROW_SIZE = 2;

  const times = Object.entries(challenges)
    .sort((a, b) => (b[1]?.total ?? 0) - (a[1]?.total ?? 0))
    .filter(([k]) => k !== "total")
    .map(([field, game]) => (
      <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
        <img image={gameIcons[field as keyof typeof gameIcons]} width={32} height={32} />
        <text>§l{FormattedGame[field as keyof typeof FormattedGame] ?? field}</text>
        <div width="remaining" margin={{ left: 4, right: 4 }} />
        <text>{t(game.total)}</text>
      </box>
    ));

  const groups = arrayGroup(times, ROW_SIZE);

  return (
    <Table.table>
      {groups.map((group) => (
        <Table.tr>{group}</Table.tr>
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
  const metadata = MetadataScanner.scan(constructor);
  const entries = Object.entries(gameChallenges);

  const GROUP_SIZE = entries.length < 5 ? 4 : (entries.length - 1) ** 0.5;

  const groups = arrayGroup(
    entries
      .filter(([k]) => k !== "total")
      .sort((a, b) => b[1] - a[1])
      .map(([challenge, completions]) => {
        const field = metadata.find(([k]) => k === challenge);
        const realname = field?.[1]?.leaderboard?.name ?? prettify(challenge);
        return [realname, t(completions)];
      }),
    GROUP_SIZE
  );

  const colors = ["§b", "§a", "§2", "§e", "§6", "§c", "§4"];

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
  const { challenges } = player.stats.general;

  const { api } = mode;
  let table: JSX.Element;

  switch (api) {
    case "overall":
      table = <NormalTable challenges={challenges} t={t} gameIcons={gameIcons} />;
      break;
    default:
      table = (
        <GameTable
          gameChallenges={challenges[api]}
          constructor={challenges[api].constructor}
          t={t}
        />
      );
      break;
  }

  const sidebar: SidebarItem[] = [[t("stats.total"), t(challenges.total), "§b"]];

  if (api !== "overall") {
    sidebar.push([
      t("stats.game-total", { game: removeFormatting(FormattedGame[api]) }),
      t(challenges[api].total),
      "§a",
    ]);
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l§aChallenges §r(§l${
          FormattedGame[api as keyof typeof FormattedGame] ?? prettify(api)
        }§r)`}
        sidebar={sidebar}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
