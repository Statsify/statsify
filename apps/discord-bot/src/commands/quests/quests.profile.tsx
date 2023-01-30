/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box, DeferredGradient, useGradient } from "@statsify/rendering";
import {
  ClassMetadata,
  DailyQuests,
  FormattedGame,
  GameId,
  GameMode,
  GameQuests,
  GenericQuestInstance,
  METADATA_KEY,
  MetadataScanner,
  OverallQuests,
  QuestModes,
  QuestTime,
  User,
  UserPalette,
  WeeklyQuests,
} from "@statsify/schemas";
import { Container, Footer, GameEntry, GameList, Header, SidebarItem } from "#components";
import { DateTime } from "luxon";
import { HistoricalTimeData } from "components/Historical/Historical-Header";
import { HistoricalTimes } from "@statsify/api-client";
import { Palette, getColorPalette } from "../../themes/palette";
import { ratio } from "@statsify/math";
import type { BaseProfileProps } from "../base.hypixel-command";
import type { Constructor } from "@statsify/util";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";

function getQuestMetadata<T>(constructor: Constructor<T>) {
  const entries = Object.entries(
    Reflect.getMetadata(METADATA_KEY, constructor.prototype) as ClassMetadata
  );

  const metadata = entries.map(([key, data]) => [
    key,
    Object.fromEntries(MetadataScanner.scan(data.type.type)),
  ]);

  return Object.fromEntries(metadata);
}

const questMetadata = [DailyQuests, WeeklyQuests, OverallQuests].map((constructor) =>
  getQuestMetadata(constructor as Constructor<GenericQuestInstance>)
);

export interface QuestProfileProps extends Omit<BaseProfileProps, "time"> {
  mode: GameMode<QuestModes>;
  gameIcons: Record<GameId, Image>;
  logos: [check: Image, cross: Image];
  time: QuestTime;
}

interface NormalTableProps {
  quests: GenericQuestInstance;
  t: LocalizeFunction;
  gameIcons: Record<GameId, Image>;
  time: QuestTime;
  colorPalette?: Palette;
}

const GRADIENT_OFFSET = 0.66;

const NormalTable = ({ quests, t, gameIcons, colorPalette, time }: NormalTableProps) => {
  const questEntries = Object.entries(quests);

  if (time === QuestTime.Overall) {
    const entries: GameEntry[] = questEntries
      .sort((a, b) => (b[1]?.total ?? 0) - (a[1]?.total ?? 0))
      .map(([k, v]) => [k as GameId, t(v.total)]);

    return <GameList entries={entries} gameIcons={gameIcons} />;
  }

  const BOX_COLOR = (colorPalette?.boxes?.color as string) ?? Box.DEFAULT_COLOR;

  const entries: GameEntry[] = questEntries
    .map(([k, v]) => [k, v, Object.keys(v).length - 1] as const)
    .sort((a, b) => ratio(b[1]?.total ?? 0, b[2]) - ratio(a[1]?.total ?? 0, a[2]))
    .map(([k, v, total]) => {
      const completed = v.total;

      let textColor: string;
      let boxColor: DeferredGradient;

      if (completed === total) {
        textColor = "§a";
        boxColor = useGradient(
          "horizontal",
          [GRADIENT_OFFSET, BOX_COLOR],
          [1, "hsl(145, 45%, 44%, 0.5)"]
        );
      } else if (completed >= 1) {
        textColor = "§6";
        boxColor = useGradient(
          "horizontal",
          [GRADIENT_OFFSET, BOX_COLOR],
          [1, "hsla(42, 17%, 48%, 0.5)"]
        );
      } else {
        textColor = "§c";
        boxColor = useGradient(
          "horizontal",
          [GRADIENT_OFFSET, BOX_COLOR],
          [1, "hsla(337, 31%, 43%, 0.5)"]
        );
      }

      return [
        k as GameId,
        `${textColor}${t(completed)}/${t(total)}`,
        { color: boxColor },
      ];
    });

  return <GameList entries={entries} gameIcons={gameIcons} />;
};

interface GameTableProps {
  quests: GameQuests;
  t: LocalizeFunction;
  time: QuestTime;
  game: keyof typeof FormattedGame;
  logos: [Image, Image];
}

const GameTable = ({ quests, t, game, time, logos }: GameTableProps) => {
  const isOverall = time === QuestTime.Overall;

  const entries = Object.entries(quests)
    .filter(([k, v]) => k !== "total" && v !== null)
    .sort((a, b) => b[1] - a[1])
    .map(([quest, completions]) => {
      const name = questMetadata[time][game][quest].leaderboard.name;

      return (
        <box width="100%">
          <text align="left">
            {completions > 0 ? "§a" : "§c"}§l{name}
          </text>
          <div width="remaining" />
          {isOverall ? (
            <text>{t(completions)}</text>
          ) : (
            <img margin={2} image={logos[completions]} />
          )}
        </box>
      );
    });

  return (
    <div width="100%" direction="column">
      {entries}
    </div>
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
  time,
  logos,
}: QuestProfileProps) => {
  const { quests } = player.stats;

  let period: "overall" | "weekly" | "daily";
  let historicalTime: "LIVE" | HistoricalTimeData;

  switch (time) {
    case QuestTime.Overall:
      period = "overall";
      historicalTime = "LIVE";
      break;

    case QuestTime.Weekly:
      period = "weekly";
      historicalTime = { timeType: HistoricalTimes.WEEKLY };
      break;

    case QuestTime.Daily:
      period = "daily";
      historicalTime = { timeType: HistoricalTimes.DAILY };
      break;
  }

  const { api, formatted } = mode;
  let table: JSX.Element;

  const colorPalette = User.isDiamond(user)
    ? getColorPalette(user?.theme?.palette ?? UserPalette.DEFAULT)
    : undefined;

  switch (api) {
    case "overall":
      table = (
        <NormalTable
          quests={quests[period]}
          time={time}
          t={t}
          gameIcons={gameIcons}
          colorPalette={colorPalette}
        />
      );
      break;

    default:
      table = (
        <GameTable
          quests={quests[period][api]}
          game={api}
          time={time}
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
      t(quests[period][api].total),
      "§a",
    ]);
  }

  const title =
    api in FormattedGame
      ? `§l${FormattedGame[api as keyof typeof FormattedGame]}`
      : formatted;

  if (time === QuestTime.Weekly) {
    const dt = DateTime.now().setZone("America/New_York").startOf("week");

    (historicalTime as HistoricalTimeData).startTime =
      dt.plus({ days: 4 }).toMillis() < Date.now()
        ? dt.plus({ days: 4 })
        : dt.minus({ days: 3 });

    (historicalTime as HistoricalTimeData).endTime = (
      historicalTime as HistoricalTimeData
    ).startTime!.plus({ days: 6 });
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l§eQuests §r(${title}§r)`}
        sidebar={sidebar}
        time={historicalTime}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
