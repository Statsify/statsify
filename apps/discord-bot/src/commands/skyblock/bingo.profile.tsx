/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card } from "./components/Card.js";
import { type SidebarItem, Table } from "#components";
import { arrayGroup, formatTime } from "@statsify/util";
import { getGridRows } from "./components/ItemGrid.js";
import type { BingoGoal, BingoView, PlayerRef } from "@statsify/skyblock";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";
import type { User } from "@statsify/schemas";

interface SkyBlockBingoProfileProps {
  bingo: PlayerRef & BingoView;
  now: number;
  skin: Image;
  badge?: Image;
  background: Image;
  logo: Image;
  user: User | null;
  t: LocalizeFunction;
  title: string;
}

const COLUMNS = 5;
const LINE_LENGTH = 12;

function getGoalColor({ community, completed }: BingoGoal) {
  if (community) return "§6";
  return completed ? "§a" : "§7";
}

// On one line, a row of long goal names makes the card too wide for a phone.
const splitGoalName = (name: string) => {
  const spaces = [...name.matchAll(/ /g)].map(({ index }) => index);
  if (name.length <= LINE_LENGTH || spaces.length === 0) return [name];

  const middle = name.length / 2;
  const split = spaces.reduce((best, index) =>
    Math.abs(index - middle) < Math.abs(best - middle) ? index : best,
  );
  return [name.slice(0, split), name.slice(split + 1)];
};

// Table.td's small cell, with the name over several lines
const GoalCell = ({
  lines,
  value,
  color,
}: {
  lines: string[];
  value: string;
  color: string;
}) => (
  <box
    direction="column"
    location="center"
    width="100%"
    padding={{ left: 5, right: 5 }}
  >
    <>
      {lines.map((line, index) => (
        <text
          margin={{ top: index === 0 ? 6 : 0, bottom: 2, left: 1, right: 1 }}
        >
          {line && `${color}${line}`}
        </text>
      ))}
    </>
    <text margin={{ top: 0, bottom: 6 }}>{`${color}${value}`}</text>
  </box>
);

export const SkyBlockBingoProfile = ({
  bingo,
  now,
  t,
  ...card
}: SkyBlockBingoProfileProps) => {
  const { player, goals, end } = bingo;
  const personal = goals.filter(({ community }) => !community).length;

  const sidebar: SidebarItem[] = [
    [t("skyblock.bingo.points"), t(player?.points ?? 0), "§6"],
    [
      t("skyblock.bingo.goals"),
      `${t(player?.completed ?? 0)}§7/${t(personal)}`,
      "§a",
    ],
    [t("skyblock.bingo.events"), t(player?.events ?? 0), "§d"],
    [
      t("skyblock.bingo.timeLeft"),
      now < end
        ? formatTime(end - now, { entries: 2 })
        : t("skyblock.bingo.over"),
      "§e",
    ],
  ];

  const cells = arrayGroup(goals, COLUMNS).flatMap((row) => {
    const names = row.map(({ name }) => splitGoalName(name));
    const lineCount = Math.max(...names.map((lines) => lines.length));

    // A short name drops to its row's last line, so the values stay level.
    return row.map((goal, index) => (
      <GoalCell
        lines={[
          ...Array.from({ length: lineCount - names[index].length }, () => ""),
          ...names[index],
        ]}
        value={
          goal.community
            ? t("skyblock.bingo.tier", goal.community)
            : t(goal.completed ? "skyblock.bingo.done" : "skyblock.bingo.open")
        }
        color={getGoalColor(goal)}
      />
    ));
  });

  return (
    <Card {...card} name={bingo.displayName} sidebar={sidebar}>
      <Table.table>{getGridRows(cells, COLUMNS)}</Table.table>
    </Card>
  );
};
