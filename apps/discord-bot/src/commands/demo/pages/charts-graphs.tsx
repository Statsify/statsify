/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BarChart, Container, Footer, GAME_COLORS, Graph, Header } from "#components";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { DemoPageProps } from "../demo.command.js";

const seededPoints = (uuid: string, base: number, count: number) => {
  const hex = uuid.replace(/-/g, "");
  return Array.from({ length: count }, (_, i) => {
    const h = hex.slice((i * 2) % 32, (i * 2) % 32 + 2);
    const jitter = (Number.parseInt(h, 16) / 255 - 0.5) * 0.4;
    return { label: `W${i + 1}`, value: Math.max(0, base * (1 + jitter)) };
  });
};

export const renderChartsPage = ({
  player,
  skin,
  logo,
  badge,
  background,
  user,
}: DemoPageProps) => {
  const bw = player.stats.bedwars;
  const overall = bw.overall;

  const fkdrPoints = seededPoints(player.uuid, overall.fkdr, 10);
  const wlrPoints = seededPoints(player.uuid, overall.wlr, 10);

  const modeWins = [
    { label: "Solo", value: bw.solo.wins || 0, color: GAME_COLORS.bedwars },
    { label: "Doubles", value: bw.doubles.wins || 0, color: "#f97316" },
    { label: "3s", value: bw.threes.wins || 0, color: "#facc15" },
    { label: "4s", value: bw.fours.wins || 0, color: "#a78bfa" },
    { label: "4v4", value: bw["4v4"].wins || 0, color: "#38bdf8" },
  ];

  const activityData = Array.from({ length: 12 }, (_, i) => {
    const h = player.uuid.replace(/-/g, "").slice(i * 2, i * 2 + 2);
    return Math.round((Number.parseInt(h, 16) / 255) * 80);
  });

  const canvas = render(
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title="§lCharts §f& §lGraphs"
        description="§7Showcasing §fGraph§7, §fBarChart§7, §fsparkbar"
        time="LIVE"
        sidebar={[]}
      />
      <div width="100%" direction="row">
        <div width="1/2" direction="column">
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lFKDR §8vs §7WLR Trend</text>
            <Graph
              points={fkdrPoints}
              series={[{ points: wlrPoints, color: "#4ade80", fillColor: "rgba(74,222,128,0.12)" }]}
              color={GAME_COLORS.bedwars}
              fillColor="rgba(239,68,68,0.14)"
              smooth
              height={80}
              showLastValue
            />
          </box>
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lRecent Activity</text>
            <sparkbar
              data={activityData}
              height={36}
              color={GAME_COLORS.bedwars}
              highlightLast
              highlightColor="#fbbf24"
              width="100%"
            />
          </box>
        </div>
        <div width="1/2" direction="column">
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lMode Wins (Vertical)</text>
            <BarChart items={modeWins} sort={false} />
          </box>
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lMode Wins (Horizontal)</text>
            <BarChart items={modeWins} sort={false} orientation="horizontal" gradientFill />
          </box>
        </div>
      </div>
      <Footer logo={logo} user={user} />
    </Container>,
    getTheme(user)
  );

  return canvas;
};
