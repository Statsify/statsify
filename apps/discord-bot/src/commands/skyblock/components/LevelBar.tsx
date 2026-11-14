/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Progression } from "@statsify/schemas";
import { Table, formatProgression, lineXpBar } from "#components";
import { arrayGroup } from "@statsify/util";
import type { Level } from "@statsify/skyblock";
import type { LocalizeFunction } from "@statsify/discord";

// A note line's height: size 2 text is 20px tall
const NOTE_HEIGHT = 20;

export interface LevelBarProps {
  title: string;
  level: Level;
  color: string;
  t: LocalizeFunction;
  notes?: string[]; // lines under the bar
  lines?: number; // note lines to make room for, blank past the notes
}

export const LevelBar = ({ title, level, color, t, notes = [], lines = notes.length }: LevelBarProps) => {
  const progression = new Progression(level.xpCurrent, level.xpForNext ?? 0);

  return (
    <box direction="column" location="center" width="100%">
      <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`${color}${title}`}</text>
      <text margin={{ top: 0, bottom: 4, left: 10, right: 10 }}>{`§^4^${color}${t(level.level)}`}</text>
      <text margin={{ top: 0, bottom: lines > 0 ? 4 : 8, left: 10, right: 10 }}>
        {formatProgression({
          t,
          progression,
          currentLevel: "",
          nextLevel: "",
          showProgress: false,
          renderXp: lineXpBar(color),
        })}
      </text>
      <>
        {Array.from({ length: lines }, (_, index) => {
          const margin = { top: 0, bottom: index === lines - 1 ? 8 : 2, left: 10, right: 10 };
          return index < notes.length ? <text margin={margin}>{notes[index]}</text> : <div height={NOTE_HEIGHT} margin={margin} />;
        })}
      </>
    </box>
  );
};

/** Level bars in rows. A bar with fewer notes than its row keeps blank lines, so the row's boxes end level. */
export const levelBarRows = (bars: LevelBarProps[], columns: number) =>
  arrayGroup(bars, columns).map((row) => {
    const lines = Math.max(...row.map(({ notes = [] }) => notes.length));
    return <Table.tr>{row.map((bar) => <LevelBar {...bar} lines={lines} />)}</Table.tr>;
  });
