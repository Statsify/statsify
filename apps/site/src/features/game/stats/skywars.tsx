/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HeadlineTable, OverviewTable, PageLayout, Selections, StatList, StatRow, type StatsGame, StatTable, statFor, useListed } from "./parts";
import { formatTime, prettify } from "@statsify/util/util";
import type { ApiModeFromGameModes, PlayerStats, SkyWarsModes } from "@statsify/schemas";

type SkyWars = PlayerStats["skywars"];
type Mode = ApiModeFromGameModes<SkyWarsModes>;

const Stat = statFor<SkyWars>();

/** The challenges card's wins, in its order. */
const CHALLENGES = [
  "totalWins",
  "archerWins",
  "halfHealthWins",
  "noBlockWins",
  "noChestWins",
  "paperWins",
  "rookieWins",
  "uhcWins",
  "ultimateWarriorWins",
] as const satisfies (keyof SkyWars["challenges"])[];

const done = (value: number) => (value > 0 ? "§a" : "§c");

function Overview() {
  return (
    <OverviewTable>
      <Stat path="coins" color="§6" />
      <Stat path="tokens" color="§2" />
      <Stat path="souls" color="§b" />
      <Stat path="opals" color="§9" />
      <Stat path="heads" color="§5" />
      <Stat path="potionsBrewed" color="§d" />
    </OverviewTable>
  );
}

/** The card's table, with the mode's kit as a line under it, and Games Played beside it. */
function Headline({ mode }: { mode: Mode }) {
  const games = (
    <StatTable title="game.sections.games">
      <Stat path={`${mode}.gamesPlayed`} color="§e" />
    </StatTable>
  );

  return (
    <HeadlineTable columns={3} aside={games}>
      <StatRow>
        <Stat path={`${mode}.wins`} color="§a" />
        <Stat path={`${mode}.losses`} color="§c" />
        <Stat path={`${mode}.wlr`} color="§6" />
      </StatRow>
      <StatRow>
        <Stat path={`${mode}.kills`} color="§a" />
        <Stat path={`${mode}.deaths`} color="§c" />
        <Stat path={`${mode}.kdr`} color="§6" />
      </StatRow>
      <StatRow>
        <Stat path={`${mode}.assists`} color="§a" />
        <Stat path={`${mode}.playtime`} color="§c" format={(ms) => formatTime(Number(ms))} />
      </StatRow>
      <Selections>
        {/* Hypixel sends the Normal and Insane kits; the schema keeps the one the player has more wins with. */}
        <Stat path={`${mode}.kit`} color="§6" format={(kit) => prettify(String(kit))} />
      </Selections>
    </HeadlineTable>
  );
}

/** The challenge wins, which the bot gives a card of its own: they're stored once for the game, not per mode. */
function Challenges() {
  const challenges = useListed(CHALLENGES.map((key) => `challenges.${key}` as const));

  return (
    <StatList title="game.sections.challenges">
      {challenges.map((path) => <Stat key={path} path={path} color={done} />)}
    </StatList>
  );
}

/** The card's sidebar over the table every mode shares, then Games Played; Overall adds the challenge wins. */
function Page({ mode }: { mode: Mode }) {
  return (
    <PageLayout overview={<Overview />}>
      <Headline mode={mode} />
      {mode === "overall" && <Challenges />}
    </PageLayout>
  );
}

export const SKYWARS_PAGE: StatsGame<SkyWars, Mode> = {
  Page,
  level: (skywars) => ({
    key: "exp",
    current: skywars.levelFormatted,
    natural: skywars.naturalLevelFormatted,
    next: skywars.nextLevelFormatted,
    progression: skywars.progression,
  }),
  preview: (mode) => [
    { path: `${mode}.wins` },
    { path: `${mode}.losses` },
    { path: `${mode}.wlr` },
    { path: `${mode}.kills` },
    { path: `${mode}.deaths` },
    { path: `${mode}.kdr` },
  ],
};
