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
  GAME_COLORS,
  Gauge,
  Header,
  ProgressBar,
  RadarChart,
} from "#components";
import { LocalizeFunction } from "@statsify/discord";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { DemoPageProps } from "../demo.command.js";

const fakeT = String as unknown as LocalizeFunction;

export const renderRadialPage = ({
  player,
  skin,
  logo,
  badge,
  background,
  user,
}: DemoPageProps) => {
  const bw = player.stats.bedwars;
  const overall = bw.overall;

  const levelFrac = bw.level - Math.floor(bw.level);
  const levelPct = Math.round(levelFrac * 100);
  const totalWins = bw.overall.wins || 0;
  const totalLosses = bw.overall.losses || 1;

  const radarAxes = [
    { label: "FKDR", value: overall.fkdr, max: 10 },
    { label: "WLR", value: overall.wlr, max: 5 },
    { label: "KDR", value: overall.kdr, max: 5 },
    { label: "BBLR", value: overall.bblr, max: 5 },
    { label: "FK/G", value: overall.fkdr * 2.5, max: 20 },
  ];

  const modeWins = [
    { value: bw.solo.wins || 1, color: GAME_COLORS.bedwars },
    { value: bw.doubles.wins || 1, color: "#f97316" },
    { value: bw.threes.wins || 1, color: "#facc15" },
    { value: bw.fours.wins || 1, color: "#a78bfa" },
    { value: bw["4v4"].wins || 1, color: "#38bdf8" },
  ];

  const canvas = render(
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title="§lRadial §f& §lDistribution"
        description="§7Showcasing §fGauge§7, §fRadarChart§7, §fDonut§7, §fProgressBar"
        time="LIVE"
        sidebar={[]}
      />
      <div width="100%" direction="row">
        <div width="1/3" direction="column" location="center">
          <box width="100%" direction="column" padding={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 6, left: 0, right: 0 }}>§lPrestige Level</text>
            <Gauge
              value={levelPct}
              min={0}
              max={100}
              fillColor={GAME_COLORS.bedwars}
              label={`${Math.floor(bw.level)}✫`}
              sublabel={`${levelPct}% to next`}
              size={100}
            />
          </box>
          <box width="100%" direction="column" padding={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 6, left: 0, right: 0 }}>§lWin Rate</text>
            <ProgressBar
              color={GAME_COLORS.bedwars}
              numerator={totalWins}
              denominator={totalWins + totalLosses}
              t={fakeT}
            />
          </box>
        </div>
        <div width="1/3" direction="column" location="center">
          <box width="100%" direction="column" padding={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 6, left: 0, right: 0 }}>§lStat Radar</text>
            <RadarChart axes={radarAxes} color={GAME_COLORS.bedwars} fillColor="rgba(239,68,68,0.2)" size={140} />
          </box>
        </div>
        <div width="1/3" direction="column" location="center">
          <box width="100%" direction="column" padding={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 6, left: 0, right: 0 }}>§lMode Distribution</text>
            <donut
              segments={modeWins}
              innerRadius={0.55}
              width={120}
              height={120}
            />
          </box>
          <box width="100%" direction="column" padding={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 6, left: 0, right: 0 }}>§lMode Share (Pie)</text>
            <donut
              segments={modeWins}
              innerRadius={0}
              width={120}
              height={120}
            />
          </box>
        </div>
      </div>
      <Footer logo={logo} user={user} />
    </Container>,
    getTheme(user)
  );

  return canvas;
};
