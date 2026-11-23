/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  HeadlineTable,
  OverviewTable,
  PageLayout,
  StatList,
  type StatPath,
  StatRow,
  type StatsGame,
  StatTable,
  statFor,
  useListed,
  useShown,
  useStatNames,
  useStatsKind,
} from "./parts";
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

function Overview({ mode }: { mode: Mode }) {
  const wallet = useShown(hasWallet);

  if (mode === "challenges") {
    return (
      <OverviewTable>
        <Stat path="challenges.totalChallenges" color="§6" />
        <Stat path="challenges.uniqueChallenges" color="§e" />
      </OverviewTable>
    );
  }

  return (
    <OverviewTable>
      <Stat path="tokens" color="§2" />
      {wallet && <Stat path="slumber.tickets" label="stats.slumberTickets" color="§b" of="slumber.wallet" />}
      {wallet && <Stat path="slumber.totalTickets" label="stats.totalSlumberTickets" color="§d" />}
    </OverviewTable>
  );
}

/** The card's table: rows of a count, its opposite and their ratio, the kills rows under Final and Normal. */
function Headline({ mode }: { mode: TableMode }) {
  return (
    <HeadlineTable columns={3} aside={<Aside mode={mode} />}>
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
    </HeadlineTable>
  );
}

function Aside({ mode }: { mode: TableMode }) {
  const session = useStatsKind() === "session";
  const streak = useShown((bedwars: BedWars) => bedwars[mode].winstreak !== 0);

  return (
    <>
      <StatTable title="game.sections.resources">
        <Stat path={`${mode}.itemsCollected.iron`} label="stats.iron" color="§7" />
        <Stat path={`${mode}.itemsCollected.gold`} label="stats.gold" color="§6" />
        <Stat path={`${mode}.itemsCollected.diamond`} label="stats.diamonds" color="§b" />
        <Stat path={`${mode}.itemsCollected.emerald`} label="stats.emeralds" color="§2" />
      </StatTable>
      <StatTable title="game.sections.games">
        <Stat path={`${mode}.gamesPlayed`} color="§e" />
        {/* Core's winstreak is a copy of Overall's. The Dreams modes don't track one and always store 0. */}
        {mode !== "core" && streak && !session && <Stat path={`${mode}.winstreak`} color="§a" />}
      </StatTable>
    </>
  );
}

/** The bot's challenges card: every challenge in its order, under its leaderboard name. */
function Challenges() {
  // The challenges the schema has, in its order: the API names each one.
  const names = Object.keys(useStatNames()).filter((path) => path.startsWith("challenges.") && !TOTALS.includes(path)) as StatPath<BedWars>[];
  const challenges = useListed(names);

  return (
    <PageLayout overview={<Overview mode="challenges" />}>
      <StatList>
        {challenges.map((path) => <Stat key={path} path={path} color={done} />)}
      </StatList>
    </PageLayout>
  );
}

function Page({ mode }: { mode: Mode }) {
  if (mode === "challenges") return <Challenges />;

  return (
    <PageLayout overview={<Overview mode={mode} />}>
      <Headline mode={mode} />
    </PageLayout>
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
  preview: (mode) =>
    mode === "challenges" ?
      [{ path: "challenges.totalChallenges" }, { path: "challenges.uniqueChallenges" }] :
      [
        { path: `${mode}.wins` },
        { path: `${mode}.losses` },
        { path: `${mode}.wlr` },
        { path: `${mode}.finalKills` },
        { path: `${mode}.finalDeaths` },
        { path: `${mode}.fkdr` },
      ],
};
