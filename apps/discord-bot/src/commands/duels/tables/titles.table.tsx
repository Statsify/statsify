/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Duels, type TitleRequirement, getTitleAndProgression } from "@statsify/schemas";
import type { DuelsModeIcons } from "../duels.command.js";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";

interface TitlesTableProps {
  duels: Duels;
  t: LocalizeFunction;
  modeIcons: DuelsModeIcons;
}

interface TitleMode {
  icon: Image;
  mode: string;
  score: number;
  titleRequirement: TitleRequirement;
}

function ModeTitle({
  icon,
  title,
  score,
  t,
}: {
  icon: Image;
  title: string;
  score: number;
  t: LocalizeFunction;
}) {
  return (
    <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
      <img image={icon} width={32} height={32} />
      <text margin={{ left: 8 }}>{title}</text>
      <div width="remaining" margin={{ left: 4, right: 4 }} />
      <text>{t(score)}</text>
    </box>
  );
}

export const TitlesTable = ({ duels, t, modeIcons }: TitlesTableProps) => {
  const getBaseTitle = (
    score: number,
    mode: string,
    titleRequirement: TitleRequirement
  ) =>
    getTitleAndProgression({
      score,
      mode,
      data: {},
      titleRequirement,
    }).titleFormatted;

  const titleSortScore = (score: number, titleRequirement: TitleRequirement) => {
    if (titleRequirement === "half") return score * 2;
    if (titleRequirement === "overall") return score / 2;

    return score;
  };

  const games = [
    { icon: modeIcons.arena, mode: "Duel Arena", score: duels.arena.kills, titleRequirement: "default" },
    { icon: modeIcons.bedwars, mode: "Bed Wars", score: duels.bedwars.overall.wins, titleRequirement: "default" },
    { icon: modeIcons.blitzsg, mode: "Blitz", score: duels.blitzsg.wins, titleRequirement: "default" },
    { icon: modeIcons.bow, mode: "Bow", score: duels.bow.wins, titleRequirement: "default" },
    { icon: modeIcons.spleef, mode: "Spleef", score: duels.spleef.overallWins, titleRequirement: "default" },
    { icon: modeIcons.boxing, mode: "Boxing", score: duels.boxing.wins, titleRequirement: "half" },
    { icon: modeIcons.bridge, mode: "Bridge", score: duels.bridge.overall.wins, titleRequirement: "half" },
    { icon: modeIcons.classic, mode: "Classic", score: duels.classic.overall.wins, titleRequirement: "default" },
    { icon: modeIcons.combo, mode: "Combo", score: duels.combo.wins, titleRequirement: "default" },
    { icon: modeIcons.megawalls, mode: "Mega Walls", score: duels.megawalls.wins, titleRequirement: "half" },
    { icon: modeIcons.nodebuff, mode: "NoDebuff", score: duels.nodebuff.wins, titleRequirement: "half" },
    { icon: modeIcons.op, mode: "OP", score: duels.op.overall.wins, titleRequirement: "default" },
    { icon: modeIcons.quake, mode: "Quakecraft", score: duels.quake.wins, titleRequirement: "default" },
    { icon: modeIcons.parkour, mode: "Parkour", score: duels.parkour.wins, titleRequirement: "half" },
    { icon: modeIcons.skywars, mode: "SkyWars", score: duels.skywars.overall.wins, titleRequirement: "default" },
    { icon: modeIcons.sumo, mode: "Sumo", score: duels.sumo.wins, titleRequirement: "default" },
    { icon: modeIcons.uhc, mode: "UHC", score: duels.uhc.overall.wins, titleRequirement: "default" },
  ] satisfies TitleMode[];

  games.sort(
    (a, b) =>
      titleSortScore(b.score, b.titleRequirement) -
      titleSortScore(a.score, a.titleRequirement)
  );

  const rows = games.reduce<TitleMode[][]>((acc, game, index) => {
    const rowIndex = Math.floor(index / 2);

    acc[rowIndex] ??= [];
    acc[rowIndex].push(game);

    return acc;
  }, []);

  const overallTitle = getBaseTitle(duels.overall.wins, "", "overall");

  return (
    <div width="100%" direction="column">
      <ModeTitle
        icon={modeIcons.overall}
        title={overallTitle}
        score={duels.overall.wins}
        t={t}
      />

      <div width="100%" direction="column">
        {rows.map((row) => (
          <div width="100%">
            {[...row].reverse().map(({ icon, mode, score, titleRequirement }) => (
              <div width={row.length === 1 ? "100%" : "1/2"}>
                <ModeTitle
                  icon={icon}
                  title={getBaseTitle(score, mode, titleRequirement)}
                  score={score}
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