/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Boxes,
  HeadlineTable,
  OverviewTable,
  PageLayout,
  Selections,
  StatList,
  type StatPath,
  StatRow,
  type StatsGame,
  StatTable,
  type StatValue,
  readStat,
  statFor,
  usePlayerStats,
  useStatsKind,
} from "./parts";
import { formatTime, prettify } from "@statsify/util/util";
import type { ApiModeFromGameModes, DuelsModes, PlayerStats } from "@statsify/schemas";
import type { ReactNode } from "react";

type Duels = PlayerStats["duels"];
type Mode = ApiModeFromGameModes<DuelsModes>;
type Path = StatPath<Duels>;
/** The places below Duels that store `K` (`bridge.doubles` for `goals`). */
type PlaceWith<K extends string> = Path extends infer P ? (P extends `${infer Place}.${K}` ? Place : never) : never;

const Stat = statFor<Duels>();

/** Where each mode keeps the wins its title counts: its Overall where it has submodes, both Spleef modes' total for Spleef. */
const WINS = {
  overall: "overall.wins",
  arena: "arena.wins",
  bedwars: "bedwars.overall.wins",
  blitzsg: "blitzsg.wins",
  bow: "bow.wins",
  spleef: "spleef.overallWins",
  boxing: "boxing.wins",
  bridge: "bridge.overall.wins",
  classic: "classic.overall.wins",
  combo: "combo.wins",
  megawalls: "megawalls.wins",
  nodebuff: "nodebuff.wins",
  op: "op.overall.wins",
  quake: "quake.wins",
  parkour: "parkour.wins",
  skywars: "skywars.overall.wins",
  sumo: "sumo.wins",
  uhc: "uhc.overall.wins",
} as const satisfies Record<Mode, Path>;

/** The modes on Overall's Titles, as the card lists them (every mode but Arena). */
const TITLES = [
  "bedwars", "blitzsg", "bow", "spleef", "boxing", "bridge", "classic", "combo", "megawalls", "nodebuff", "op", "quake", "parkour",
  "skywars", "sumo", "uhc",
] as const satisfies Mode[];

/** The modes the card draws as Overall, Solo and Doubles boxes, each leading with its Overall box. */
const BOXED = ["classic", "op", "skywars"] as const satisfies Mode[];
type BoxedMode = (typeof BOXED)[number];
const isBoxed = (mode: Mode): mode is BoxedMode => (BOXED as readonly Mode[]).includes(mode);

type Place = PlaceWith<"kdr"> | "arena" | "parkour" | "spleef.bowSpleef" | "spleef.spleef";
const placeOf = (mode: Mode, submode: string | null) => (submode ? `${mode}.${submode}` : mode) as Place;

// Arena, Parkour and both Spleef modes count no kills.
const countsKills = (place: Place): place is PlaceWith<"kdr"> => place !== "arena" && place !== "parkour" && place !== "spleef.bowSpleef" && place !== "spleef.spleef";

// Hypixel leaves winstreaks out for a player who hides them, which reads back as 0. One win is a streak of one, so
// wins with no best winstreak mean they're hidden.
const streaksHidden = ({ overall }: Duels) => overall.wins > 0 && !overall.bestWinstreak;

const streaksOf = (at: PlaceWith<"bestWinstreak">): StatValue<Duels>[] => [
  { path: `${at}.winstreak`, hidden: streaksHidden },
  { path: `${at}.bestWinstreak`, hidden: streaksHidden },
];

function Streaks({ at }: { at: PlaceWith<"bestWinstreak"> }) {
  if (useStatsKind() === "session") return null;

  return (
    <StatRow>
      <Stat path={`${at}.winstreak`} color="§e" hidden={streaksHidden} />
      <Stat path={`${at}.bestWinstreak`} color="§e" hidden={streaksHidden} />
    </StatRow>
  );
}

function Record({ at }: { at: PlaceWith<"wlr"> }) {
  return (
    <StatRow>
      <Stat path={`${at}.wins`} color="§a" />
      <Stat path={`${at}.losses`} color="§c" />
      <Stat path={`${at}.wlr`} color="§6" />
    </StatRow>
  );
}

function Kills({ at }: { at: PlaceWith<"kdr"> }) {
  return (
    <StatRow>
      <Stat path={`${at}.kills`} color="§a" />
      <Stat path={`${at}.deaths`} color="§c" />
      <Stat path={`${at}.kdr`} color="§6" />
    </StatRow>
  );
}

function ShotsFired({ at }: { at: PlaceWith<"shotsFired"> }) {
  return <Stat path={`${at}.shotsFired`} color="§6" />;
}

function Kit({ at }: { at: PlaceWith<"kit"> }) {
  return (
    <Selections>
      <Stat path={`${at}.kit`} color="§e" format={(kit) => prettify(String(kit))} />
    </Selections>
  );
}

function More({ children }: { children: ReactNode }) {
  return <StatTable title="game.sections.more">{children}</StatTable>;
}

function ParkourMore() {
  const session = useStatsKind() === "session";

  return (
    <More>
      {!session && <Stat path="parkour.bestTime" color="§d" unset="N/A" format={(ms) => formatTime(Number(ms))} />}
      <Stat path="parkour.checkpoints" color="§5" />
    </More>
  );
}

/**
 * The card's sidebar stats that belong to the mode (the game's go in the overview), by where the mode keeps them.
 * Bridge's and UHC's teams show the mode's overall Shots Fired on the card, not their own, so they have none.
 */
const MORE: Partial<Record<Place, ReactNode>> = {
  overall: <More><ShotsFired at="overall" /></More>,
  arena: <More><ShotsFired at="arena" /></More>,
  bow: <More><ShotsFired at="bow" /></More>,
  "bridge.overall": <More><ShotsFired at="bridge.overall" /></More>,
  "spleef.bowSpleef": <More><ShotsFired at="spleef.bowSpleef" /></More>,
  blitzsg: (
    <StatTable title="game.sections.more" columns={1}>
      <StatRow><ShotsFired at="blitzsg" /></StatRow>
      <Kit at="blitzsg" />
    </StatTable>
  ),
  quake: (
    <More>
      <ShotsFired at="quake" />
      <Stat path="quake.headshots" color="§3" />
    </More>
  ),
  parkour: <ParkourMore />,
  "bedwars.overall": <More><Stat path="bedwars.overall.itemsPurchased" color="§d" /></More>,
  "spleef.spleef": <More><Stat path="spleef.spleef.blocksBroken" color="§b" /></More>,
  "uhc.overall": (
    <More>
      <ShotsFired at="uhc.overall" />
      <Stat path="uhc.gapplesEaten" color="§a" />
    </More>
  ),
};

function Overview() {
  const session = useStatsKind() === "session";

  return (
    <OverviewTable>
      <Stat path="tokens" color="§2" />
      {!session && <Stat path="pingRange" color="§a" suffix="ms" />}
      <Stat path="overall.blocksPlaced" color="§9" />
    </OverviewTable>
  );
}

/** The mode's first table: the card's streaks over its record and kills, laid out by what the mode stores. */
function Headline({ mode, submode }: { mode: Exclude<Mode, BoxedMode>; submode: string | null }) {
  const place = placeOf(mode, submode);
  const aside = MORE[place];

  if (mode === "bridge") {
    const at = place as PlaceWith<"goals">;
    return (
      <HeadlineTable columns={4} aside={aside}>
        <Streaks at={at} />
        <StatRow>
          <Stat path={`${at}.wins`} color="§a" />
          <Stat path={`${at}.losses`} color="§c" />
          <Stat path={`${at}.wlr`} color="§6" />
          <Stat path={`${at}.goals`} color="§e" />
        </StatRow>
        <Kills at={at} />
      </HeadlineTable>
    );
  }

  if (place === "bedwars.overall") {
    return (
      <HeadlineTable columns={3} aside={aside}>
        <Streaks at={place} />
        <Record at={place} />
        <StatRow>
          <Stat path="bedwars.overall.finalKills" color="§a" />
          <Stat path="bedwars.overall.finalDeaths" color="§c" />
          <Stat path="bedwars.overall.fkdr" color="§6" />
        </StatRow>
        <Kills at={place} />
        <StatRow>
          <Stat path="bedwars.overall.bedsBroken" color="§a" />
          <Stat path="bedwars.overall.bedsLost" color="§c" />
          <Stat path="bedwars.overall.bblr" color="§6" />
        </StatRow>
      </HeadlineTable>
    );
  }

  return (
    <HeadlineTable columns={3} aside={aside}>
      <Streaks at={place} />
      <Record at={place} />
      {countsKills(place) && <Kills at={place} />}
    </HeadlineTable>
  );
}

/** One of the card's boxes (Overall, Solo, Doubles), each with its own Shots Fired. */
function BoxTable({ mode, box, name }: { mode: BoxedMode; box: "overall" | "solo" | "doubles"; name: string }) {
  const at = `${mode}.${box}` as const;

  return (
    <StatTable name={name} columns={2}>
      <Streaks at={at} />
      <StatRow>
        <Stat path={`${at}.wins`} color="§a" />
        <Stat path={`${at}.kills`} color="§a" />
      </StatRow>
      <StatRow>
        <Stat path={`${at}.losses`} color="§c" />
        <Stat path={`${at}.deaths`} color="§c" />
      </StatRow>
      <StatRow>
        <Stat path={`${at}.wlr`} color="§6" />
        <Stat path={`${at}.kdr`} color="§6" />
      </StatRow>
      <StatRow>
        <ShotsFired at={at} />
      </StatRow>
    </StatTable>
  );
}

/** Every mode's title and the wins it counts, the most wins first; a session's gains say nothing of a title. */
function Titles() {
  const duels = usePlayerStats<Duels>();
  const session = useStatsKind() === "session";
  if (!duels || session) return null;

  const wins = (mode: (typeof TITLES)[number]) => Number(readStat(duels, WINS[mode])) || 0;
  const sorted = TITLES.toSorted((a, b) => wins(b) - wins(a));

  return (
    <StatList title="game.sections.titles" plain>
      {sorted.map((mode) => <Stat key={mode} path={WINS[mode]} name={(stats) => stats[mode].titleFormatted} color="§f" />)}
    </StatList>
  );
}

function Page({ mode, submode }: { mode: Mode; submode: string | null }) {
  const compare = useStatsKind() === "compare";

  if (isBoxed(mode)) {
    return (
      <PageLayout overview={<Overview />}>
        <Boxes>
          <BoxTable mode={mode} box="overall" name="§6Overall" />
          <BoxTable mode={mode} box="solo" name="§6Solo" />
          <BoxTable mode={mode} box="doubles" name="§6Doubles" />
        </Boxes>
        {/* A table of only the kit, which a comparison leaves out. */}
        {mode === "skywars" && !compare && (
          <HeadlineTable title="game.sections.more" columns={0}>
            <Kit at="skywars" />
          </HeadlineTable>
        )}
      </PageLayout>
    );
  }

  return (
    <PageLayout overview={<Overview />}>
      <Headline mode={mode} submode={submode} />
      {mode === "overall" && <Titles />}
    </PageLayout>
  );
}

export const DUELS_PAGE: StatsGame<Duels, Mode> = {
  Page,
  // BedWars and Spleef name their games without the mode, as the card does ("Bed Rush", "Bow Spleef").
  heading: ({ mode, submode, submodes }) => {
    const own = (mode === "bedwars" && submode !== "overall") || mode === "spleef";
    const name = submodes.find(({ key }) => key === submode)?.name;
    return own && name ? { mode: name } : {};
  },
  level: (duels, mode) => {
    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = duels[mode];
    return {
      key: WINS[mode],
      label: "stats.title",
      current: titleFormatted,
      natural: titleLevelFormatted,
      next: nextTitleLevelFormatted,
      progression,
      progress: "stats.progression.win",
    };
  },
  preview: (mode, submode) => {
    if (isBoxed(mode)) {
      const at = `${mode}.overall` as const;
      // A box puts wins beside kills, and losses beside deaths.
      return [...streaksOf(at), { path: `${at}.wins` }, { path: `${at}.kills` }, { path: `${at}.losses` }, { path: `${at}.deaths` }];
    }

    const at = placeOf(mode, submode);
    const record: StatValue<Duels>[] = [...streaksOf(at), { path: `${at}.wins` }, { path: `${at}.losses` }, { path: `${at}.wlr` }];
    if (mode === "bridge") return [...record, { path: `${at as PlaceWith<"goals">}.goals` }];
    if (at === "bedwars.overall") return [...record, { path: "bedwars.overall.finalKills" }];
    return countsKills(at) ? [...record, { path: `${at}.kills` }] : record;
  },
};
