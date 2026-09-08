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
  Header,
  HeatmapChart,
  LeaderboardRow,
  VersusPanel,
} from "#components";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { DemoPageProps } from "../demo.command.js";

const HYPIXEL_BW_AVERAGES = {
  fkdr: 1.2,
  wlr: 0.8,
  kdr: 0.9,
  bblr: 0.7,
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const renderComparisonPage = ({
  player,
  skin,
  logo,
  badge,
  background,
  user,
}: DemoPageProps) => {
  const bw = player.stats.bedwars;
  const overall = bw.overall;

  const heatCells = Array.from({ length: 7 * 8 }, (_, i) => {
    const hex = player.uuid.replace(/-/g, "");
    const h = hex.slice(i % 32, i % 32 + 2);
    return Math.round((Number.parseInt(h, 16) / 255) * 60);
  });

  const leaderboardEntries = [
    { rank: 1, name: "§6§lHyperion_Max", value: 28.4 },
    { rank: 2, name: "§b§lSkyblaze", value: 21.7 },
    { rank: 3, name: "§a§lVineBreaker", value: 18.3 },
    { rank: 4, name: player.username, value: overall.fkdr },
    { rank: 5, name: "§7VoidStrider", value: Math.max(0, overall.fkdr - 0.8) },
  ].sort((a, b) => b.value - a.value).map((e, i) => ({ ...e, rank: i + 1 }));

  const leftPlayer = {
    name: player.prefixName,
    stats: [
      { label: "FKDR", leftValue: overall.fkdr, rightValue: HYPIXEL_BW_AVERAGES.fkdr },
      { label: "WLR", leftValue: overall.wlr, rightValue: HYPIXEL_BW_AVERAGES.wlr },
      { label: "KDR", leftValue: overall.kdr, rightValue: HYPIXEL_BW_AVERAGES.kdr },
      { label: "BBLR", leftValue: overall.bblr, rightValue: HYPIXEL_BW_AVERAGES.bblr },
    ],
  };

  const rightPlayer = {
    name: "§7Hypixel Average",
    stats: [
      { label: "FKDR", leftValue: overall.fkdr, rightValue: HYPIXEL_BW_AVERAGES.fkdr },
      { label: "WLR", leftValue: overall.wlr, rightValue: HYPIXEL_BW_AVERAGES.wlr },
      { label: "KDR", leftValue: overall.kdr, rightValue: HYPIXEL_BW_AVERAGES.kdr },
      { label: "BBLR", leftValue: overall.bblr, rightValue: HYPIXEL_BW_AVERAGES.bblr },
    ],
  };

  const canvas = render(
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title="§lComparison §f& §lRanking"
        description="§7Showcasing §fVersusPanel§7, §fLeaderboardRow§7, §fHeatmapChart"
        time="LIVE"
        sidebar={[]}
      />
      <div width="100%" direction="row">
        <div width="1/2" direction="column">
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lvs Hypixel Average</text>
            <VersusPanel left={leftPlayer} right={rightPlayer} />
          </box>
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            {[
              <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lFKDR Leaderboard (Simulated)</text>,
              ...leaderboardEntries.map((e) => (
                <LeaderboardRow
                  rank={e.rank}
                  name={e.name}
                  value={e.value.toFixed(2)}
                  accentColor={GAME_COLORS.bedwars}
                />
              )),
            ]}
          </box>
        </div>
        <div width="1/2" direction="column">
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lWeekly Activity Heatmap §8(seeded)</text>
            <HeatmapChart
              cells={heatCells}
              cols={8}
              rowLabels={DAYS}
              highColor={GAME_COLORS.bedwars}
              cellSize={14}
              cellGap={3}
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
