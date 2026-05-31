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
  Gauge,
  Header,
  SEMANTIC_COLORS,
  StatGrid,
} from "#components";
import { autoContrast } from "#lib/auto-contrast";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { DemoPageProps } from "../demo.command.js";

const PALETTE: Array<{ label: string; color: string; accentKey: keyof typeof GAME_COLORS }> = [
  { label: "§cBed§fWars", color: GAME_COLORS.bedwars, accentKey: "bedwars" },
  { label: "§bSky§eWars", color: GAME_COLORS.skyWars, accentKey: "skyWars" },
  { label: "§bDuels", color: GAME_COLORS.duels, accentKey: "duels" },
  { label: "§5Quake", color: GAME_COLORS.quake, accentKey: "quake" },
];

const SWATCHES = [
  SEMANTIC_COLORS.positive,
  SEMANTIC_COLORS.negative,
  SEMANTIC_COLORS.neutral,
  SEMANTIC_COLORS.warning,
  "#ef4444",
  "#f97316",
  "#eab308",
  "#4ade80",
  "#38bdf8",
  "#6366f1",
  "#d946ef",
  "#ffffff",
];

export const renderThemingPage = ({
  player,
  skin,
  logo,
  badge,
  background,
  user,
}: DemoPageProps) => {
  const bw = player.stats.bedwars;
  const overall = bw.overall;

  const canvas = render(
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title="§lTheming §f& §lKitchen Sink"
        description="§7GAME_COLORS palettes · auto-contrast · semantic colors"
        time="LIVE"
        sidebar={[]}
      />
      <div width="100%" direction="column">
        <div width="100%" direction="row">
          {PALETTE.map(({ label, color, accentKey }) => {
            const statItems = [
              { label: "FKDR", value: overall.fkdr, color: GAME_COLORS[accentKey] },
              { label: "WLR", value: overall.wlr, color: GAME_COLORS[accentKey] },
              { label: "KDR", value: overall.kdr, color: GAME_COLORS[accentKey] },
            ];

            return (
              <box
                width="1/4"
                direction="column"
                padding={{ top: 5, bottom: 5, left: 6, right: 6 }}
                margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
              >
                <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }} size={1.75}>{label}</text>
                <Gauge
                  value={Math.round((bw.level % 1) * 100)}
                  fillColor={color}
                  label={`${Math.floor(bw.level)}`}
                  size={64}
                />
                <StatGrid items={statItems} columns={1} />
              </box>
            );
          })}
        </div>
        <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
          <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lAuto-Contrast Swatches</text>
          <div direction="row">
            {SWATCHES.map((hex) => {
              const textColor = autoContrast(hex) === "#000000" ? "§0" : "§f";
              return (
                <box
                  width={24}
                  height={24}
                  margin={2}
                  padding={0}
                  color={hex}
                  shadowDistance={0}
                >
                  <text margin={0} size={1.25}>{textColor}A</text>
                </box>
              );
            })}
          </div>
        </box>
        <box width="100%" direction="column" padding={{ top: 5, bottom: 5, left: 8, right: 8 }}>
          <text margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>§lBadge Kitchen Sink</text>
          <div direction="row">
            <Badge size="sm">§7Small</Badge>
            <Badge size="md">§fMedium</Badge>
            <Badge size="lg">§bLarge</Badge>
            <Badge variant="outline" shape="pill">§7Pill</Badge>
            <Badge status="positive" variant="soft" size="sm">§aGood</Badge>
            <Badge status="negative" variant="soft" size="sm">§cBad</Badge>
          </div>
        </box>
      </div>
      <Footer logo={logo} user={user} />
    </Container>,
    getTheme(user)
  );

  return canvas;
};
