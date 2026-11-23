/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Headline, PageLayout, StatList, StatRow, type StatsGame, StatTable, statFor } from "./parts";
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

const overview = () => (
  <>
    <Stat path="coins" color="§6" />
    <Stat path="tokens" color="§2" />
    <Stat path="souls" color="§b" />
    <Stat path="opals" color="§9" />
    <Stat path="heads" color="§5" />
    <Stat path="potionsBrewed" color="§d" />
  </>
);

/** The card's table, with the mode's kit as a line under it. */
const headline = (mode: Mode) => (
  <>
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
    <StatRow>
      {/* Hypixel sends the Normal and Insane kits; the schema keeps the one the player has more wins with. */}
      <Stat path={`${mode}.kit`} color="§6" format={(kit) => prettify(String(kit))} inline />
    </StatRow>
  </>
);

/**
 * The card's sidebar over the table every mode shares, then Games Played. Overall adds the challenge wins, which the
 * bot gives a card of its own: they're stored once for the game, not per mode.
 */
function Page({ mode }: { mode: Mode }) {
  return (
    <PageLayout overview={overview()}>
      <Headline
        aside={
          <StatTable title="game.sections.games">
            <StatRow>
              <Stat path={`${mode}.gamesPlayed`} color="§e" />
            </StatRow>
          </StatTable>
        }
      >
        {headline(mode)}
      </Headline>
      {mode === "overall" && (
        <StatList title="game.sections.challenges">
          {CHALLENGES.map((key) => <Stat key={key} path={`challenges.${key}`} color={done} />)}
        </StatList>
      )}
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
  overview,
  headline,
};
