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
  type GameId,
  type GameMode,
  GameQuests,
  GenericQuestInstance,
  METADATA_KEY,
  MetadataScanner,
  MonthlyQuests,
  OverallQuests,
  type QuestProgress,
  QuestModes,
  QuestTime,
  User,
  UserPalette,
  WeeklyQuests,
} from "@statsify/schemas";
import {
  Container,
  Footer,
  GameEntry,
  GameList,
  Header,
  type HistoricalTimeData,
  SidebarItem,
} from "#components";
import { DateTime } from "luxon";
import { HistoricalTimes } from "@statsify/api-client";
import { Palette, getColorPalette } from "../../themes/palette.js";
import { ratio } from "@statsify/math";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
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

const questMetadata = {
  [QuestTime.Daily]: getQuestMetadata(DailyQuests as Constructor<GenericQuestInstance>),
  [QuestTime.Weekly]: getQuestMetadata(WeeklyQuests as Constructor<GenericQuestInstance>),
  [QuestTime.Monthly]: getQuestMetadata(MonthlyQuests as Constructor<GenericQuestInstance>),
  [QuestTime.Overall]: getQuestMetadata(OverallQuests as Constructor<GenericQuestInstance>),
};

export interface QuestProfileProps extends Omit<BaseProfileProps, "time"> {
  mode: GameMode<QuestModes>;
  gameIcons: Record<GameId, Image>;
  logos: [cross: Image, check: Image];
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
    .map(([k, v]) => {
      const questCount = Object.keys(v).filter((key) => key !== "total" && key !== "_progress").length;
      return [k, v, questCount] as const;
    })
    .filter(([_, __, questCount]) => questCount > 0)
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
          [1, "hsla(120, 100%, 30%, 0.5)"]
        );
      } else if (completed >= 1) {
        textColor = "§6";
        boxColor = useGradient(
          "horizontal",
          [GRADIENT_OFFSET, BOX_COLOR],
          [1, "hsla(40, 100%, 30%, 0.5)"]
        );
      } else {
        textColor = "§c";
        boxColor = useGradient(
          "horizontal",
          [GRADIENT_OFFSET, BOX_COLOR],
          [1, "hsla(0, 100%, 30%, 0.5)"]
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
  logos: [cross: Image, check: Image];
}

const GameTable = ({ quests, t, game, time, logos: [cross, check] }: GameTableProps) => {
  const isOverall = time === QuestTime.Overall;

  const entries = Object.entries(quests)
    .filter(([k, v]) => k !== "total" && k !== "_progress" && v !== null)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([quest, completions]) => {
      const name = questMetadata[time][game][quest].leaderboard.name;
      const questProgress = quests._progress?.[quest] as QuestProgress | undefined;

      return (
        <box width="100%">
          <text align="left">
            {(completions as number) > 0 ? "§a" : "§c"}§l{name}
          </text>
          <div width="remaining" />
          {isOverall ?
            <text>{t(completions as number)}</text> :
            (completions as number) > 0 ?
              <img margin={2} image={check} /> :
              questProgress ?
                <text>§e{t(questProgress.current)}/{t(questProgress.target)}</text> :
                <img margin={2} image={cross} />
          }
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

  let period: "overall" | "weekly" | "daily" | "monthly";
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

    case QuestTime.Monthly:
      period = "monthly";
      historicalTime = { timeType: HistoricalTimes.MONTHLY };
      break;
  }

  const { api, formatted } = mode;
  let table: JSX.Element;

  const colorPalette = User.isDiamond(user) ?
    getColorPalette(user?.theme?.palette ?? UserPalette.DEFAULT) :
    undefined;

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
    api in FormattedGame ?
      `§l${FormattedGame[api as keyof typeof FormattedGame]}` :
      formatted;

  if (time === QuestTime.Weekly) {
    const dt = DateTime.now().setZone("America/New_York").startOf("week");

    (historicalTime as HistoricalTimeData).startTime =
      dt.plus({ days: 4 }).toMillis() < Date.now() ?
        dt.plus({ days: 4 }) :
        dt.minus({ days: 3 });

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
