/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUELS_TITLES, type Duels, type DuelsTitle, getTitleAndProgression } from "@statsify/schemas";
import { arrayGroup } from "@statsify/util";
import type { DuelsModeIcons } from "../duels.command.js";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";

interface TitlesTableProps {
  duels: Duels;
  t: LocalizeFunction;
  modeIcons: DuelsModeIcons;
}

interface TitleMode {
  mode: DuelsTitle;
  score: number;
}

const defaultColorTitle = ({ mode, score }: TitleMode) =>
  getTitleAndProgression({ score, data: {}, ...DUELS_TITLES[mode] }).titleFormatted;

const normalizedScore = ({ mode, score }: TitleMode) =>
  DUELS_TITLES[mode].titleRequirement === "half" ? score * 2 : score;

function ModeTitle({ icon, title, score, t }: { icon: Image; title: string; score: number; t: LocalizeFunction }) {
  return (
    <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
      <img image={icon} width={32} height={32} />
      <text margin={{ left: 8 }}>
        {title}
      </text>
      <div width="remaining" margin={{ left: 4, right: 4 }} />
      <text>{t(score)}</text>
    </box>
  );
}

export const TitlesTable = ({ duels, t, modeIcons }: TitlesTableProps) => {
  const overall: TitleMode = { mode: "overall", score: duels.overall.wins };

  const games: TitleMode[] = [
    { mode: "arena", score: duels.arena.kills },
    { mode: "bedwars", score: duels.bedwars.overall.wins },
    { mode: "blitzsg", score: duels.blitzsg.wins },
    { mode: "bow", score: duels.bow.wins },
    { mode: "spleef", score: duels.spleef.overallWins },
    { mode: "boxing", score: duels.boxing.wins },
    { mode: "bridge", score: duels.bridge.overall.wins },
    { mode: "classic", score: duels.classic.overall.wins },
    { mode: "combo", score: duels.combo.wins },
    { mode: "megawalls", score: duels.megawalls.wins },
    { mode: "nodebuff", score: duels.nodebuff.wins },
    { mode: "op", score: duels.op.overall.wins },
    { mode: "quake", score: duels.quake.wins },
    { mode: "parkour", score: duels.parkour.wins },
    { mode: "skywars", score: duels.skywars.overall.wins },
    { mode: "sumo", score: duels.sumo.wins },
    { mode: "uhc", score: duels.uhc.overall.wins },
  ];

  games.sort((a, b) => normalizedScore(b) - normalizedScore(a));
  const rows = arrayGroup(games, 2);

  return (
    <div width="100%" direction="column">
      <ModeTitle
        icon={modeIcons.overall}
        title={defaultColorTitle(overall)}
        score={overall.score}
        t={t}
      />
      <div width="100%" direction="column">
        {rows.map((row) => (
          <div width="100%">
            {row.map((game) => (
              <div width={`1/${row.length}`}>
                <ModeTitle
                  icon={modeIcons[game.mode]}
                  title={defaultColorTitle(game)}
                  score={game.score}
                  t={t}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
