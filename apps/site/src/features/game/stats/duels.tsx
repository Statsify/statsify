/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Boxes, Headline, PageLayout, StatList, type StatPath, StatRow, type StatsGame, StatTable, readStat, statFor, usePlayerStats } from "./parts";
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

// Hypixel leaves winstreaks out for a player who hides them, which reads back as 0. One win is a streak of one, so
// wins with no best winstreak mean they're hidden.
const streaksHidden = ({ overall }: Duels) => overall.wins > 0 && !overall.bestWinstreak;

const streaks = (at: PlaceWith<"bestWinstreak">) => (
  <StatRow>
    <Stat path={`${at}.winstreak`} color="§e" hidden={streaksHidden} session={false} />
    <Stat path={`${at}.bestWinstreak`} color="§e" hidden={streaksHidden} session={false} />
  </StatRow>
);

const record = (at: PlaceWith<"wlr">) => (
  <StatRow>
    <Stat path={`${at}.wins`} color="§a" />
    <Stat path={`${at}.losses`} color="§c" />
    <Stat path={`${at}.wlr`} color="§6" />
  </StatRow>
);

const kills = (at: PlaceWith<"kdr">) => (
  <StatRow>
    <Stat path={`${at}.kills`} color="§a" />
    <Stat path={`${at}.deaths`} color="§c" />
    <Stat path={`${at}.kdr`} color="§6" />
  </StatRow>
);

const shotsFired = (at: PlaceWith<"shotsFired">) => <Stat path={`${at}.shotsFired`} color="§6" />;

const kit = (at: PlaceWith<"kit">) => (
  <StatRow>
    <Stat path={`${at}.kit`} color="§e" format={(kit) => prettify(String(kit))} inline />
  </StatRow>
);

/** The card's sidebar rows that belong to the mode (the game's go in the overview), or none. */
function moreRows(place: string): ReactNode {
  switch (place) {
    case "overall":
    case "arena":
    case "bow":
    case "bridge.overall":
    case "spleef.bowSpleef":
      return <StatRow>{shotsFired(place)}</StatRow>;
    case "blitzsg":
      return (
        <>
          <StatRow>{shotsFired("blitzsg")}</StatRow>
          {kit("blitzsg")}
        </>
      );
    case "quake":
      return (
        <StatRow>
          {shotsFired("quake")}
          <Stat path="quake.headshots" color="§3" />
        </StatRow>
      );
    case "parkour":
      return (
        <StatRow>
          <Stat path="parkour.bestTime" color="§d" unset="N/A" format={(ms) => formatTime(Number(ms))} session={false} />
          <Stat path="parkour.checkpoints" color="§5" />
        </StatRow>
      );
    case "bedwars.overall":
      return <StatRow><Stat path="bedwars.overall.itemsPurchased" color="§d" /></StatRow>;
    case "spleef.spleef":
      return <StatRow><Stat path="spleef.spleef.blocksBroken" color="§b" /></StatRow>;
    case "uhc.overall":
      return (
        <StatRow>
          {shotsFired("uhc.overall")}
          <Stat path="uhc.gapplesEaten" color="§a" />
        </StatRow>
      );
    default:
      // Bridge's and UHC's teams show the mode's overall Shots Fired on the card, not their own, so they show none.
      return null;
  }
}

function more(place: string) {
  const rows = moreRows(place);
  return rows && <StatTable title="game.sections.more">{rows}</StatTable>;
}

/** The mode's first table: the card's streaks over its record and kills, laid out by what the mode stores. */
function headline(mode: Mode, submode: string | null) {
  // Classic, OP and SkyWars lead with their Overall box.
  if (mode === "classic" || mode === "op" || mode === "skywars") return box(mode, "overall");

  const place = (submode ? `${mode}.${submode}` : mode) as PlaceWith<"kdr"> | "arena" | "parkour" | "spleef.bowSpleef" | "spleef.spleef";

  if (mode === "bridge") {
    const at = place as PlaceWith<"goals">;
    return (
      <>
        {streaks(at)}
        <StatRow>
          <Stat path={`${at}.wins`} color="§a" />
          <Stat path={`${at}.losses`} color="§c" />
          <Stat path={`${at}.wlr`} color="§6" />
          <Stat path={`${at}.goals`} color="§e" />
        </StatRow>
        {kills(at)}
      </>
    );
  }

  if (place === "bedwars.overall") {
    return (
      <>
        {streaks(place)}
        {record(place)}
        <StatRow>
          <Stat path="bedwars.overall.finalKills" color="§a" />
          <Stat path="bedwars.overall.finalDeaths" color="§c" />
          <Stat path="bedwars.overall.fkdr" color="§6" />
        </StatRow>
        {kills(place)}
        <StatRow>
          <Stat path="bedwars.overall.bedsBroken" color="§a" />
          <Stat path="bedwars.overall.bedsLost" color="§c" />
          <Stat path="bedwars.overall.bblr" color="§6" />
        </StatRow>
      </>
    );
  }

  // Arena, Parkour and both Spleef modes count no kills.
  const killless = place === "arena" || place === "parkour" || place === "spleef.bowSpleef" || place === "spleef.spleef";

  return (
    <>
      {streaks(place)}
      {record(place)}
      {!killless && kills(place)}
    </>
  );
}

/** One of the card's boxes (Overall, Solo, Doubles), each with its own Shots Fired. */
const box = (mode: "classic" | "op" | "skywars", which: "overall" | "solo" | "doubles") => (
  <>
    {streaks(`${mode}.${which}`)}
    <StatRow>
      <Stat path={`${mode}.${which}.wins`} color="§a" />
      <Stat path={`${mode}.${which}.kills`} color="§a" />
    </StatRow>
    <StatRow>
      <Stat path={`${mode}.${which}.losses`} color="§c" />
      <Stat path={`${mode}.${which}.deaths`} color="§c" />
    </StatRow>
    <StatRow>
      <Stat path={`${mode}.${which}.wlr`} color="§6" />
      <Stat path={`${mode}.${which}.kdr`} color="§6" />
    </StatRow>
    <StatRow>{shotsFired(`${mode}.${which}`)}</StatRow>
  </>
);

/** Every mode's title and the wins it counts, the most wins first. */
function Titles() {
  const duels = usePlayerStats<Duels>();
  const wins = (mode: (typeof TITLES)[number]) => Number(duels && readStat(duels, WINS[mode])) || 0;
  const sorted = TITLES.toSorted((a, b) => wins(b) - wins(a));

  return (
    <StatList title="game.sections.titles" plain>
      {sorted.map((mode) => (
        <Stat key={mode} path={WINS[mode]} name={(stats) => stats[mode].titleFormatted} color="§f" session={false} />
      ))}
    </StatList>
  );
}

function Page({ mode, submode }: { mode: Mode; submode: string | null }) {
  const overview = DUELS_PAGE.overview(mode);

  if (mode === "classic" || mode === "op" || mode === "skywars") {
    return (
      <PageLayout overview={overview}>
        <Boxes>
          <StatTable name="§6Overall">{box(mode, "overall")}</StatTable>
          <StatTable name="§6Solo">{box(mode, "solo")}</StatTable>
          <StatTable name="§6Doubles">{box(mode, "doubles")}</StatTable>
        </Boxes>
        {mode === "skywars" && <Headline title="game.sections.more">{kit("skywars")}</Headline>}
      </PageLayout>
    );
  }

  const place = submode ? `${mode}.${submode}` : mode;

  return (
    <PageLayout overview={overview}>
      <Headline aside={more(place)}>{headline(mode, submode)}</Headline>
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
  overview: () => (
    <>
      <Stat path="tokens" color="§2" />
      <Stat path="pingRange" color="§a" suffix="ms" session={false} />
      <Stat path="overall.blocksPlaced" color="§9" />
    </>
  ),
  headline,
};
