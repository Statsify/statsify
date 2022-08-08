/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, GameList, Header, SidebarItem, Table } from "#components";
import {
  FormattedGame,
  GameId,
  GameMode,
  GameQuests,
  MetadataScanner,
  QuestModes,
  QuestsInstance,
} from "@statsify/schemas";
import { HistoricalType } from "@statsify/api-client";
import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "../base.hypixel-command";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";

export interface QuestProfileProps extends BaseProfileProps {
  mode: GameMode<QuestModes>;
  gameIcons: Record<GameId, Image>;
  questTimePeriod: "overall" | "daily" | "weekly";
}

interface NormalTableProps {
  quests: QuestsInstance;
  t: LocalizeFunction;
  gameIcons: Record<GameId, Image>;
}

const NormalTable = ({ quests, t, gameIcons }: NormalTableProps) => {
  const entries: [GameId, any][] = Object.entries(quests)
    .sort((a, b) => (b[1]?.total ?? 0) - (a[1]?.total ?? 0))
    .map(([k, v]) => [k as GameId, t(v.total)]);

  return <GameList entries={entries} gameIcons={gameIcons} rowSize={2} />;
};

interface GameTableProps {
  gameQuests: GameQuests;
  constructor: any;
  t: LocalizeFunction;
}

const GameTable = ({ gameQuests, constructor, t }: GameTableProps) => {
  const metadata = MetadataScanner.scan(constructor);
  const entries = Object.entries(gameQuests);

  const GROUP_SIZE = entries.length < 5 ? 4 : (entries.length - 1) ** 0.5;

  const groups = arrayGroup(
    entries
      .filter(([k, v]) => k !== "total" && v !== null)
      .sort((a, b) => b[1] - a[1])
      .map(([quest, completions]) => {
        const field = metadata.find(([k]) => k === quest);
        const realName = field?.[1]?.leaderboard?.name ?? prettify(quest);
        return [realName, t(completions)];
      }),
    GROUP_SIZE
  );

  const colors = ["§a", "§e", "§6", "§c", "§4"];

  return (
    <Table.table>
      {groups.map((g, i) => (
        <Table.tr>
          {g.map((quest) => (
            <Table.td title={quest[0]} value={quest[1]} color={colors[i]} />
          ))}
        </Table.tr>
      ))}
    </Table.table>
  );
};

export const QuestsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  gameIcons,
  questTimePeriod,
}: QuestProfileProps) => {
  const { quests } = player.stats.general;

  const { api, formatted } = mode;
  let table: JSX.Element;

  switch (api) {
    case "overall":
      table = (
        <NormalTable quests={quests[questTimePeriod]} t={t} gameIcons={gameIcons} />
      );
      break;
    default:
      table = (
        <GameTable
          gameQuests={quests[questTimePeriod][api]}
          constructor={quests[questTimePeriod][api].constructor}
          t={t}
        />
      );
      break;
  }

  const sidebar: SidebarItem[] = [[t("stats.total"), t(quests.total), "§b"]];

  if (api !== "overall") {
    sidebar.push([
      t("stats.game-total", { game: formatted }),
      t(quests[questTimePeriod][api].total),
      "§a",
    ]);
  }

  const title =
    api in FormattedGame
      ? `§l${FormattedGame[api as keyof typeof FormattedGame]}`
      : formatted;

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l§eQuests §r(${title}§r)`}
        sidebar={sidebar}
        time={
          questTimePeriod == "overall"
            ? "LIVE"
            : (questTimePeriod.toUpperCase() as HistoricalType)
        }
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
