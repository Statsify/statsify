/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  GameList,
  Header,
  List,
  SidebarItem,
  Table,
} from "#components";
import {
  FieldMetadata,
  FormattedGame,
  GameId,
  GameMode,
  GameQuests,
  MetadataScanner,
  QuestModes,
  QuestsInstance,
} from "@statsify/schemas";
import { HistoricalType } from "@statsify/api-client";
import { prettify } from "@statsify/util";
import type { BaseProfileProps } from "../base.hypixel-command";
import type { ElementNode } from "@statsify/rendering";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";

type QuestTimePeriod = "overall" | "daily" | "weekly";

export interface QuestProfileProps extends BaseProfileProps {
  mode: GameMode<QuestModes>;
  gameIcons: Record<GameId, Image>;
  logos: [check: Image, cross: Image];
  questTimePeriod: QuestTimePeriod;
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

  return <GameList entries={entries} gameIcons={gameIcons} />;
};

interface GameTableProps {
  gameQuests: GameQuests;
  constructor: any;
  t: LocalizeFunction;
  questTimePeriod: QuestTimePeriod;
  logos: [Image, Image];
}

const GameTable = ({
  gameQuests,
  constructor,
  t,
  questTimePeriod,
  logos,
}: GameTableProps) => {
  const metadata: Record<string, FieldMetadata> = Object.fromEntries(
    MetadataScanner.scan(constructor)
  );

  const entries: [string, ElementNode][] = Object.entries(gameQuests)
    .filter(([k, v]) => k !== "total" && v !== null)
    .sort((a, b) => b[1] - a[1])
    .map(([quest, completions]) => {
      const realName = metadata[quest]?.leaderboard?.name ?? prettify(quest);

      return [
        `${completions > 0 ? "§a" : "§c"}§l${realName}`,
        questTimePeriod === "overall" ? (
          <text>{t(completions)}</text>
        ) : (
          <img margin={2} image={logos[completions]} />
        ),
      ];
    });

  return (
    <Table.table>
      <List
        items={entries.map(([name, value]) => (
          <>
            <box
              width="remaining"
              border={{ bottomLeft: 4, bottomRight: 0, topLeft: 4, topRight: 0 }}
              direction="column"
            >
              <text align="left">{name}</text>
            </box>
            <box border={{ bottomLeft: 0, bottomRight: 4, topLeft: 0, topRight: 4 }}>
              {value}
            </box>
          </>
        ))}
      />
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
  logos,
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
          questTimePeriod={questTimePeriod}
          logos={logos}
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
