/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, If, List } from "#components";
import { LEADERBOARD_RATIOS } from "@statsify/schemas";
import { PostLeaderboardRankingsResponse } from "@statsify/api-client";
import { formatPosition } from "#lib/format-position";
import { games, removeGameDash } from "./games";
import type { BaseProfileProps } from "../base.hypixel-command";

const shouldColor = (stats: string[], field: string) =>
  stats.some((s) => field.includes(s));

const formatStat = (stat: PostLeaderboardRankingsResponse, game?: string) => {
  const field = stat.field.toLowerCase();
  const name = game ? stat.name.replace(`${game} `, "") : stat.name;

  let color = "§7";

  const green = [...LEADERBOARD_RATIOS.map((r) => r[0].toLowerCase())];
  const red = [...LEADERBOARD_RATIOS.map((r) => r[1].toLowerCase())];
  const gold = [...LEADERBOARD_RATIOS.map((r) => r[2].toLowerCase()), "coins", "gold"];
  const yellow = ["assists", "gamesplayed", "lootchests"];
  const aqua = ["exp", "level", "diamond", "goals"];
  const darkGreen = ["emerald"];
  const pink = ["karma"];

  if (shouldColor(green, field)) color = "§a";
  else if (shouldColor(red, field)) color = "§c";
  else if (shouldColor(gold, field)) color = "§6";
  else if (shouldColor(yellow, field)) color = "§e";
  else if (shouldColor(aqua, field)) color = "§b";
  else if (shouldColor(darkGreen, field)) color = "§2";
  else if (shouldColor(pink, field)) color = "§d";

  return `§l${color}${name}`;
};

export interface RankingsProfileProps extends Omit<BaseProfileProps, "time"> {
  data: PostLeaderboardRankingsResponse[];
  game?: string;
}

export const RankingsProfile = ({
  background,
  logo,
  user,
  data,
  t,
  player,
  skin,
  game,
  badge,
}: RankingsProfileProps) => {
  const listTitles = ["Statistic", "Pos", "Value"];
  if (!game) listTitles.unshift("Game");

  const titles = listTitles.map((field) => (
    <box
      width={field === "Statistic" ? "remaining" : "100%"}
      border={{ topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }}
    >
      <text>§l{field}</text>
    </box>
  ));

  const items = data.map((d) => {
    const originGameKey = d.field.split(".")[1];
    const originGame = games.find((g) => g.key === originGameKey);

    return (
      <>
        <If condition={!game && originGame}>
          <box width="100%">
            <text>§l{removeGameDash(originGame?.formatted as string)}</text>
          </box>
        </If>
        <box width="remaining" direction="column">
          <text align="left" t:ignore>
            {formatStat(d, originGame?.formatted ?? game)}
          </text>
        </box>
        <box width="100%">
          <text>{formatPosition(t, d.rank)}</text>
        </box>
        <box width="100%">
          <text>{typeof d.value === "string" ? d.value : t(d.value)}</text>
        </box>
      </>
    );
  });

  const formattedGame = game ? removeGameDash(game) : "All";

  return (
    <Container background={background}>
      <Header
        name={player.prefixName}
        skin={skin}
        time="LIVE"
        title={`§l§bLeaderboard Postions §r(§l${formattedGame}§r)`}
        badge={badge}
      />
      <List items={[<>{titles}</>, ...items]} />
      <Footer
        logo={logo}
        user={user}
        border={{ bottomLeft: 4, bottomRight: 4, topLeft: 0, topRight: 0 }}
      />
    </Container>
  );
};
