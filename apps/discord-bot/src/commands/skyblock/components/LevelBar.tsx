/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Progression } from "@statsify/schemas";
import { formatProgression, lineXpBar } from "#components";
import type { Level } from "@statsify/skyblock";
import type { LocalizeFunction } from "@statsify/discord";

export interface LevelBarProps {
  title: string;
  level: Level;
  color: string;
  t: LocalizeFunction;
  note?: string; // a line under the bar
}

export const LevelBar = ({ title, level, color, t, note }: LevelBarProps) => {
  const progression = new Progression(level.xpCurrent, level.xpForNext ?? 0);

  return (
    <box direction="column" location="center" width="100%">
      <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`${color}${title}`}</text>
      <text margin={{ top: 0, bottom: 4, left: 10, right: 10 }}>{`§^4^${color}${t(level.level)}`}</text>
      <text margin={{ top: 0, bottom: note ? 4 : 8, left: 10, right: 10 }}>
        {formatProgression({
          t,
          progression,
          currentLevel: "",
          nextLevel: "",
          showProgress: false,
          renderXp: lineXpBar(color),
        })}
      </text>
      {note ? <text margin={{ top: 0, bottom: 8, left: 10, right: 10 }}>{note}</text> : <></>}
    </box>
  );
};
