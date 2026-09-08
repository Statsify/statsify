/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Badge,
  Container,
  Footer,
  GAME_COLORS,
  Header,
  PrestigeIcon,
  RankTag,
  StatDelta,
  StatGrid,
  Trend,
} from "#components";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { DemoPageProps } from "../demo.command.js";

const seededSpark = (uuid: string, base: number) => {
  const hex = uuid.replace(/-/g, "");
  return Array.from({ length: 8 }, (_, i) => {
    const h = hex.slice((i * 3) % 30, (i * 3) % 30 + 2);
    return Math.max(0, base + (Number.parseInt(h, 16) / 255 - 0.5) * base * 0.6);
  });
};

const BEDWARS_PRESTIGE: Array<{ min: number; color: string; label: string }> = [
  { min: 0, color: "#9ca3af", label: "None" },
  { min: 100, color: "#ef4444", label: "Ruby" },
  { min: 500, color: "#a855f7", label: "Amethyst" },
  { min: 1000, color: "#eab308", label: "Gold" },
  { min: 2000, color: "#38bdf8", label: "Diamond" },
  { min: 3000, color: "#c0c0c0", label: "Platinum" },
];

export const renderStatPrimitivesPage = ({
  player,
  skin,
  logo,
  badge,
  background,
  user,
}: DemoPageProps) => {
  const bw = player.stats.bedwars;
  const overall = bw.overall;
  const fkdrSpark = seededSpark(player.uuid, overall.fkdr);
  const wlrSpark = seededSpark(player.uuid, overall.wlr);

  const statItems = [
    { label: "FKDR", value: overall.fkdr, color: GAME_COLORS.bedwars },
    { label: "WLR", value: overall.wlr, color: "#4ade80" },
    { label: "KDR", value: overall.kdr, color: "#facc15" },
    { label: "BBLR", value: overall.bblr, color: "#a78bfa" },
    { label: "Final Kills", value: overall.finalKills, color: GAME_COLORS.bedwars },
    { label: "Wins", value: overall.wins, color: "#4ade80" },
    { label: "Losses", value: overall.losses, color: "#f87171" },
    { label: "Deaths", value: overall.deaths, color: "#f87171" },
    { label: "Beds Broken", value: overall.bedsBroken, color: "#fbbf24" },
  ];

  const canvas = render(
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title="§lStat Primitives"
        description="§7Showcasing §fStatDelta§7, §fTrend§7, §fStatGrid§7, §fBadge§7, §fRankTag§7, §fPrestigeIcon"
        time="LIVE"
        sidebar={[]}
      />
      <div width="100%" direction="row">
        <div width="1/2" direction="column">
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lStat Grid</text>
            <StatGrid items={statItems} columns={3} />
          </box>
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lTrends</text>
            <Trend label="FKDR" value={overall.fkdr} delta={overall.fkdr - 1} sparkline={fkdrSpark} accentColor={GAME_COLORS.bedwars} />
            <Trend label="WLR" value={overall.wlr} delta={overall.wlr - 0.5} sparkline={wlrSpark} accentColor="#4ade80" />
            <Trend label="Losses" value={overall.losses} delta={overall.losses} inverseGood accentColor="#f87171" />
          </box>
        </div>
        <div width="1/2" direction="column">
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lStatDelta Variants</text>
            <div direction="row">
              <StatDelta value={1.23} />
              <StatDelta value={-0.45} />
              <StatDelta value={0} />
            </div>
            <div direction="row" margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <StatDelta value={5} inverseGood />
              <StatDelta value={overall.fkdr - 1} sparkline={fkdrSpark} />
            </div>
          </box>
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lBadge Variants</text>
            <div direction="row">
              <Badge>§fSolid</Badge>
              <Badge variant="outline">§7Outline</Badge>
              <Badge variant="soft">§8Soft</Badge>
            </div>
            <div direction="row" margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <Badge status="positive" shape="pill">§aPositive</Badge>
              <Badge status="negative" shape="pill">§cNegative</Badge>
              <Badge status="warning">§eWarning</Badge>
            </div>
          </box>
          <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
            <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lRank §f& §lPrestige</text>
            <div direction="row">
              <RankTag rank={player.prefixName} />
            </div>
            <div direction="row" margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <PrestigeIcon
                value={Math.floor(bw.level)}
                thresholds={BEDWARS_PRESTIGE}
                size={36}
              />
            </div>
          </box>
        </div>
      </div>
      <Footer logo={logo} user={user} />
    </Container>,
    getTheme(user)
  );

  return canvas;
};
