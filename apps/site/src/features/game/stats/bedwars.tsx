/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Headline, PageLayout, StatList, type StatPath, StatRow, type StatsGame, StatTable, statFor, useStatNames } from "./parts";
import type { ApiModeFromGameModes, BedWarsModes, PlayerStats } from "@statsify/schemas";

type BedWars = PlayerStats["bedwars"];
type Mode = ApiModeFromGameModes<BedWarsModes>;
type TableMode = Exclude<Mode, "challenges">;

const Stat = statFor<BedWars>();

const TOTALS = ["challenges.totalChallenges", "challenges.uniqueChallenges"];

// Slumber tickets show once the player has a wallet, as on the bot's card.
const hasWallet = ({ slumber }: BedWars) => slumber.wallet > 0;

// Green once completed, red before, as on the bot's challenges card.
const done = (value: number) => (value > 0 ? "§a" : "§c");

function overview(mode: Mode) {
  if (mode === "challenges") {
    return (
      <>
        <Stat path="challenges.totalChallenges" color="§6" />
        <Stat path="challenges.uniqueChallenges" color="§e" />
      </>
    );
  }

  return (
    <>
      <Stat path="tokens" color="§2" />
      <Stat path="slumber.tickets" label="stats.slumberTickets" color="§b" of="slumber.wallet" show={hasWallet} />
      <Stat path="slumber.totalTickets" label="stats.totalSlumberTickets" color="§d" show={hasWallet} />
    </>
  );
}

/** The card's table: rows of a count, its opposite and their ratio, the kills rows under Final and Normal. */
function headline(mode: Mode) {
  if (mode === "challenges") return null;

  return (
    <>
      <StatRow>
        <Stat path={`${mode}.wins`} color="§a" />
        <Stat path={`${mode}.losses`} color="§c" />
        <Stat path={`${mode}.wlr`} color="§6" />
      </StatRow>
      <StatRow title="game.table.final">
        <Stat path={`${mode}.finalKills`} short="stats.kills" color="§a" />
        <Stat path={`${mode}.finalDeaths`} short="stats.deaths" color="§c" />
        <Stat path={`${mode}.fkdr`} color="§6" />
      </StatRow>
      <StatRow title="game.table.normal">
        <Stat path={`${mode}.kills`} color="§a" />
        <Stat path={`${mode}.deaths`} color="§c" />
        <Stat path={`${mode}.kdr`} color="§6" />
      </StatRow>
      <StatRow>
        <Stat path={`${mode}.bedsBroken`} color="§a" />
        <Stat path={`${mode}.bedsLost`} color="§c" />
        <Stat path={`${mode}.bblr`} color="§6" />
      </StatRow>
    </>
  );
}

/** The bot's challenges card: every challenge in its order, under its leaderboard name. */
function Challenges() {
  // The challenges the schema has, in its order: the API names each one.
  const challenges = Object.keys(useStatNames()).filter((path) => path.startsWith("challenges.") && !TOTALS.includes(path)) as StatPath<BedWars>[];

  return (
    <PageLayout overview={overview("challenges")}>
      <StatList>
        {challenges.map((path) => <Stat key={path} path={path} color={done} />)}
      </StatList>
    </PageLayout>
  );
}

function Page({ mode }: { mode: Mode }) {
  if (mode === "challenges") return <Challenges />;

  return (
    <PageLayout overview={overview(mode)}>
      <Headline aside={<Aside mode={mode} />}>{headline(mode)}</Headline>
    </PageLayout>
  );
}

function Aside({ mode }: { mode: TableMode }) {
  return (
    <>
      <StatTable title="game.sections.resources">
        <StatRow>
          <Stat path={`${mode}.itemsCollected.iron`} label="stats.iron" color="§7" />
          <Stat path={`${mode}.itemsCollected.gold`} label="stats.gold" color="§6" />
          <Stat path={`${mode}.itemsCollected.diamond`} label="stats.diamonds" color="§b" />
          <Stat path={`${mode}.itemsCollected.emerald`} label="stats.emeralds" color="§2" />
        </StatRow>
      </StatTable>
      <StatTable title="game.sections.games">
        <StatRow>
          <Stat path={`${mode}.gamesPlayed`} color="§e" />
          {/* Core's winstreak is a copy of Overall's. The Dreams modes don't track one and always store 0. */}
          {mode !== "core" && <Stat path={`${mode}.winstreak`} color="§a" show={(stats) => stats[mode].winstreak !== 0} session={false} />}
        </StatRow>
      </StatTable>
    </>
  );
}

export const BEDWARS_PAGE: StatsGame<BedWars, Mode> = {
  Page,
  heading: ({ mode }) => (mode === "challenges" ? { word: "game.challenges", mode: null } : {}),
  level: (bedwars, mode) =>
    mode === "challenges" ?
      null :
      {
        key: "exp",
        current: bedwars.levelFormatted,
        natural: bedwars.naturalLevelFormatted,
        next: bedwars.nextLevelFormatted,
        progression: bedwars.progression,
      },
  overview,
  headline,
};
