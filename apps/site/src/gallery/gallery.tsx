/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ANRIE_UUID,
  GAME_LEVEL,
  GAME_NAV_ALL,
  GAME_PAGE,
  LEADERBOARD_PAGE,
  LIST_SECTION,
  MANY_MODES,
  OJAKEY_UUID,
  PLAYER_PAGE,
  PROGRESSION,
  RESULT_CARDS,
  SELECTION_SECTION,
  SUBMODE_PAGE,
  SUGGESTIONS,
  TITLE_LIST,
} from "./fixtures";
import { Background } from "~/components/ui/background";
import { Board } from "~/components/icons/board";
import { Box } from "~/components/ui/box";
import { Brand, Logo, Wordmark } from "~/components/icons/logo";
import { Button } from "~/components/ui/button";
import { Caret } from "~/components/icons/caret";
import { Carousel } from "~/components/ui/carousel";
import { Chevron } from "~/components/icons/chevron";
import { Command } from "~/components/ui/command";
import { Discord } from "~/components/icons/discord";
import { Divider } from "~/components/ui/divider";
import { ErrorPage } from "~/components/error-page";
import { FindPlayer, LeaderboardTable, PageNav } from "~/features/leaderboards/leaderboard-table";
import { GAME_ICONS, GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { GameHeader, GameNav, LevelPanel, ModeSwitcher, StatPanel } from "~/features/game/game-page";
import { GitHub } from "~/components/icons/github";
import { InlineStat, StatCell } from "~/components/ui/stat";
import { LogoError } from "~/components/icons/logo-error";
import { Menu } from "~/components/icons/menu";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Nametag } from "~/components/ui/nametag";
import { NotFound } from "~/components/not-found";
import { Patreon } from "~/components/icons/patreon";
import { PopoverTooltip } from "~/components/ui/tooltip";
import { ProgressBar } from "~/components/navigation-progress";
import { Progression } from "~/components/ui/progression";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { RefreshBar } from "~/features/player/refresh-bar";
import { ResultCards } from "~/features/player/result-card";
import { Search } from "~/components/search";
import { SearchIcon } from "~/components/icons/search";
import { Sidebar, SidebarItem } from "~/components/ui/sidebar";
import { SignaturePanel } from "~/features/player/signature-panel";
import { Skin, SkinBust, SkinHead } from "~/components/ui/skin";
import { Tab, Tabs } from "~/components/ui/tabs";
import { TableData } from "~/components/ui/table";
import { Twitter } from "~/components/icons/twitter";
import { YouTube } from "~/components/icons/youtube";
import { colors } from "@statsify/tokens";
import { orpc } from "~/lib/orpc";
import type { ActionResult } from "~/features/player/player-actions";

const SECTIONS = [
  ["type", "Type"],
  ["colors", "Colors and codes"],
  ["panels", "Panels"],
  ["buttons", "Buttons"],
  ["stats", "Stat cells"],
  ["games", "Game pages"],
  ["search", "Search"],
  ["refresh", "Update stats"],
  ["results", "Result cards"],
  ["leaderboards", "Leaderboards"],
  ["signature", "Signature"],
  ["home", "Home pieces"],
  ["media", "Skins, icons and backgrounds"],
  ["errors", "Errors"],
  ["navigation", "Navigation"],
] as const;

type SectionId = (typeof SECTIONS)[number][0];

const CAPTION = "text-mc-1 text-mc-gray";

const MINECRAFT_SIZES = [
  ["text-mc-1", "16"],
  ["text-mc-1.5", "24"],
  ["text-mc-2", "32"],
  ["text-mc-3", "48"],
  ["text-mc-4", "64"],
] as const;

const SANS_SIZES = ["text-16", "text-20", "text-24"] as const;

/** The § codes, in the order `colors.minecraft` lists their colors. */
const CODES = "0123456789abcdef";
const SWATCHES = Object.values(colors.minecraft).map((hex, index) => [CODES[index], hex] as const);

/** Suggestions for "an" from fixtures, never from the API, so the open sheet always shows the same rows. */
function useFixtureSearchClient() {
  const [client] = useState(() => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
    queryClient.setQueryData(orpc.search.suggest.queryKey({ input: { query: "an" } }), SUGGESTIONS);
    return queryClient;
  });

  return client;
}

/**
 * Every shared component in every state, on the dev server only (`/dev/gallery`). Hover, press and keyboard focus
 * are forced by the visual regression harness through `data-gallery-force`; everything else renders as is.
 */
export function Gallery() {
  // `LeaderboardTable` scrolls its highlighted row into view on mount; the gallery opens at the top (or the hash).
  useEffect(() => {
    if (!globalThis.location.hash) globalThis.scrollTo(0, 0);
  }, []);

  return (
    <div className="grow">
      <div className="w-container flex flex-col gap-12 px-4 py-6 text-mc-white md:px-8">
        <header className="flex flex-col gap-4">
          <h1 className="text-mc-3 font-bold">Component gallery</h1>
          <p className={CAPTION}>Dev server only. Every shared component in every state, on the fixture players.</p>
          <nav aria-label="Sections">
            <ul className="flex flex-wrap gap-x-4">
              {SECTIONS.map(([id, title]) => (
                <li key={id}>
                  <a href={`#${id}`} className="flex min-h-11 items-center text-mc-1 hover:underline">{title}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <TypeSection />
        <ColorSection />
        <PanelSection />
        <ButtonSection />
        <StatSection />
        <GameSection />
        <SearchSection />
        <RefreshSection />
        <ResultSection />
        <LeaderboardSection />
        <Section id="signature">
          <SignaturePanel page={PLAYER_PAGE} />
        </Section>
        <HomeSection />
        <MediaSection />
        <ErrorSection />
        <NavigationSection />
      </div>
    </div>
  );
}

/**
 * One section on its own copy of the page background, so a section that grows or shrinks leaves the pixels of every
 * other section alone (the visual regression harness shoots them one by one).
 */
function Section({ id, children }: { id: SectionId; children: ReactNode }) {
  const title = SECTIONS.find(([section]) => section === id)?.[1];

  return (
    <section id={id} className="relative isolate flex scroll-mt-4 flex-col gap-4 p-4" aria-labelledby={`${id}-title`}>
      <Background background="general" className="inset-0" />
      <div className="absolute inset-0 bg-[rgb(17_17_17_/0.7)] -z-10" />
      <h2 id={`${id}-title`} className="text-mc-2 font-bold">{title}</h2>
      {children}
    </section>
  );
}

/** One component state with its caption. `force` names the pseudo-class the harness forces on its first control. */
function Demo({
  label,
  force,
  className,
  children,
}: {
  label: string;
  force?: "hover" | "active" | "focus-visible";
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={className} data-gallery-force={force}>
      <figcaption className={CAPTION}>{label}</figcaption>
      <div className="pt-2">{children}</div>
    </figure>
  );
}

/** Clicks the first button inside once it can be clicked, for the states that only follow an action. */
function AfterClick({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const button = ref.current?.querySelector("button");
      if (button && !button.disabled) {
        button.click();
        clearInterval(id);
      }
    }, 50);
    return () => clearInterval(id);
  }, []);

  return <div ref={ref}>{children}</div>;
}

/**
 * Focuses the first input inside without scrolling, so the search shows its open sheet. It waits for the
 * `AfterClick` demos, because the search closes on any click outside it.
 */
function Focused({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => ref.current?.querySelector("input")?.focus({ preventScroll: true }), 500);
    return () => clearTimeout(id);
  }, []);

  return <div ref={ref}>{children}</div>;
}

function TypeSection() {
  return (
    <Section id="type">
      <div className="flex flex-col gap-3">
        {MINECRAFT_SIZES.map(([size, px]) => (
          <p key={size} className={`${size} truncate`}>
            Minecraft {px} <span className="font-bold">Bold {px}</span>
          </p>
        ))}
        {/* Glyphs the pixel font lacks come from its Unifont slices, and anything they lack from the sans stack. */}
        <p className="text-mc-1">Fallback: Łódź, Ğ, Привет, Ελλάδα, ไทย, 你好</p>
      </div>
      <div className="flex flex-col gap-2">
        {SANS_SIZES.map((size) => (
          <p key={size} className={`font-sans ${size} font-medium`}>
            Mona Sans {size.slice(5)} medium <span className="font-semibold">semibold</span>{" "}
            <span className="tabular-nums">0123456789</span>
          </p>
        ))}
      </div>
    </Section>
  );
}

function ColorSection() {
  return (
    <Section id="colors">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {SWATCHES.map(([code, hex]) => (
          <li key={code} className="flex items-center gap-2">
            <span className="size-8 shrink-0" style={{ backgroundColor: hex }} />
            <MinecraftText className="text-mc-1">{`§${code}§${code}${code}`}</MinecraftText>
          </li>
        ))}
      </ul>
      <Demo label="Formatting codes, hex colors and sizes">
        <p className="text-mc-2">
          <MinecraftText>{"§lBold§r §oItalic§r §nUnderline§r §mStrike§r §#ff55aaHex§r §^4^Size 4§r §6[2,904✫] §b[MVP§c+§b] anrie"}</MinecraftText>
        </p>
      </Demo>
      <Demo label="An unknown code stays as text">
        <p className="text-mc-2">
          <MinecraftText>{"§zNot a code §aGreen"}</MinecraftText>
        </p>
      </Demo>
    </Section>
  );
}

function PanelSection() {
  return (
    <Section id="panels">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Demo label="Default">
          <Box>A panel</Box>
        </Demo>
        <Demo label="With a title">
          <Box title={<span className="text-mc-1.5">Title</span>}>A panel with a header</Box>
        </Demo>
        <Demo label="Square bottom (tabs)">
          <Box borderRadius={{ bottom: 0 }}>A panel with a square bottom</Box>
        </Demo>
        <Demo label="Red">
          <Box variant="red">A red panel</Box>
        </Demo>
        <Demo label="Green">
          <Box variant="green">A green panel</Box>
        </Demo>
        <Demo label="Pink">
          <Box variant="pink">A pink panel</Box>
        </Demo>
      </div>
      <Demo label="Dividers">
        <div className="flex h-12 items-center gap-4">
          <Divider className="w-24" />
          <Divider variant="black" className="w-24" />
          <Divider orientation="vertical" />
          <Divider orientation="vertical" variant="black" />
        </div>
      </Demo>
    </Section>
  );
}

function ButtonSection() {
  return (
    <Section id="buttons">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Demo label="Primary">
          <Button variant="primary">Update stats</Button>
        </Demo>
        <Demo label="Secondary">
          <Button>Bingo Tracker</Button>
        </Demo>
        <Demo label="Own fill (Discord)">
          <Button variant="primary" className="content:bg-discord-500">Try On Discord</Button>
        </Demo>
        <Demo label="Link">
          <Button asChild>
            <a href="#leaderboards">Leaderboards</a>
          </Button>
        </Demo>
        <Demo label="Small primary">
          <Button variant="primary" size="small">Update stats</Button>
        </Demo>
        <Demo label="Small secondary">
          <Button size="small">Copy</Button>
        </Demo>
        <Demo label="Disabled">
          <Button variant="primary" asChild>
            <button type="button" disabled>Update in 1:35</button>
          </Button>
        </Demo>
        <Demo label="Disabled small">
          <Button size="small" asChild>
            <button type="button" disabled>Copied!</button>
          </Button>
        </Demo>
        <Demo label="Hover" force="hover">
          <Button variant="primary">Update stats</Button>
        </Demo>
        <Demo label="Pressed" force="active">
          <Button variant="primary">Update stats</Button>
        </Demo>
        <Demo label="Keyboard focus" force="focus-visible">
          <Button>Bingo Tracker</Button>
        </Demo>
        <Demo label="Long label, narrow column">
          <div className="w-40">
            <Button>Look up on Hypixel</Button>
          </div>
        </Demo>
      </div>
    </Section>
  );
}

function StatSection() {
  return (
    <Section id="stats">
      <Box title={<MinecraftText className="text-mc-1.5">{"§l§cBed§fWars"}</MinecraftText>}>
        <dl className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4">
          <StatCell label="Wins" value="2,904" color="text-mc-green" />
          <StatCell label="Losses" value="1,207" color="text-mc-red" />
          <StatCell label="WLR" value="2.41" color="text-mc-gold" />
          <StatCell label="Winstreak" value="12" color="text-mc-yellow" />
          <StatCell label="Achievement Points" value="11,874" color="text-mc-gold" />
          <StatCell label="Karma" value="58,335,210" color="text-mc-pink" />
          <StatCell label="Ranks Gifted" value="12" color="text-mc-dark-purple" />
          <StatCell label="A stat with a very long label that would wrap" value="999,999,999" />
          <StatCell label="Level" value={<MinecraftText>{"§6[2,904✫]"}</MinecraftText>} />
          <StatCell label="Gold Trophies" value="41" color="text-[#ffd700]" />
          <StatCell label="Silver Trophies" value="17" color="text-[#c0c0c0]" />
          <StatCell label="Bronze Trophies" value="9" color="text-[#cd7f32]" />
        </dl>
      </Box>
      <Demo label="Narrow cells: a two-line title, values on one line">
        <Box className="w-56">
          <dl className="grid grid-cols-2 gap-x-2 gap-y-4">
            <StatCell label="Average Member GEXP" value="128,402" color="text-mc-dark-green" />
            <StatCell label="Wins" value="2,904" color="text-mc-green" />
          </dl>
        </Box>
      </Demo>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Demo label="Inline rows">
          <Box>
            <dl className="flex flex-col gap-2">
              <InlineStat label="Guild" value="Statsify" color="text-mc-dark-green" />
              <InlineStat label="Status" value="Online" color="text-mc-green" />
              <InlineStat label="First Login" value="05/08/13, 07:20 AM UTC" color="text-mc-dark-aqua" />
              <InlineStat label="Last Game" value={<MinecraftText>{"§cBed§fWars"}</MinecraftText>} />
              <InlineStat
                label="EXP"
                value={(
                  <>
                    <span className="text-mc-aqua">1,520,000</span>/<span className="text-mc-green">2,450,000</span>
                  </>
                )}
              />
            </dl>
          </Box>
        </Demo>
        <Demo label="Inline row, value truncates">
          <Box className="w-60">
            <dl>
              <InlineStat label="Guild" value="The Longest Guild Name Anyone Made" color="text-mc-dark-green" />
            </dl>
          </Box>
        </Demo>
      </div>
    </Section>
  );
}

const [HEADLINE, RESOURCES] = GAME_PAGE.sections;
const SEVEN_MODES = { ...GAME_PAGE, modes: GAME_PAGE.modes.slice(0, 7) };
const [TOKENS] = GAME_PAGE.overview;
const LEVEL = { ...GAME_LEVEL, current: "§d[3,000✫]", progression: { current: 0, percent: 1 } };
const OVERVIEW = { title: null, rows: [GAME_PAGE.overview] };

function GameSection() {
  const { username } = GAME_PAGE;

  return (
    <Section id="games">
      <Demo label="Nametag and title, level, and the game's own stats (slumber tickets out of the wallet's size)">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[3fr_2fr]">
          <GameHeader page={GAME_PAGE} className="lg:row-span-2" />
          <LevelPanel level={GAME_LEVEL} username={username} />
          <StatPanel section={OVERVIEW} username={username} />
        </div>
      </Demo>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Demo label="Level with no next level: no bar, MAXED">
          <LevelPanel level={LEVEL} username={username} />
        </Demo>
        <Demo label="A last level that prestiges: PRESTIGED">
          <LevelPanel level={{ ...LEVEL, maxedWord: "prestiged" }} username={username} />
        </Demo>
        <Demo label="No wallet: tokens only">
          <StatPanel section={{ title: null, rows: [[TOKENS]] }} username={username} />
        </Demo>
      </div>
      <Demo label="Games: the player's game pages in the registry's order, links from md up, a Games button on phones, one never played dimmed">
        <div className="relative">
          <GameNav page={GAME_PAGE} />
        </div>
      </Demo>
      <Demo label="The Games button open on phones: a grid of the pages, the current one marked">
        {/* The open grid lies over what follows, so the demo keeps room for it. */}
        <div className="max-md:min-h-56">
          <div className="relative">
            <GameNav page={GAME_PAGE} open />
          </div>
        </div>
      </Demo>
      <Demo label="24 pages, open: past 10, the Games button at every width">
        <div className="min-h-[41rem] sm:min-h-[29rem] lg:min-h-[23rem] xl:min-h-[20rem]">
          <div className="relative">
            <GameNav page={{ ...GAME_PAGE, games: GAME_NAV_ALL }} open />
          </div>
        </div>
      </Demo>
      <Demo label="16 modes: past 10, a select at every width, Fours marked as the mode played most">
        <ModeSwitcher page={GAME_PAGE} />
      </Demo>
      <Demo label="7 modes: a select on phones, links from md up, Fours marked by a gold square">
        <ModeSwitcher page={SEVEN_MODES} />
      </Demo>
      <Demo label="7 modes: another mode, the first hovered" force="hover">
        <ModeSwitcher page={{ ...SEVEN_MODES, mode: "solo" }} />
      </Demo>
      <Demo label="A mode with submodes: up to 4, tabs at every width (segments on phones), the player's kit marked">
        <div className="flex flex-col gap-4">
          <GameHeader page={SUBMODE_PAGE} />
          <ModeSwitcher page={SUBMODE_PAGE} />
          <ModeSwitcher page={SUBMODE_PAGE} kind="submode" />
        </div>
      </Demo>
      <Demo label="45 modes: a select at every width, the player's kit marked">
        <ModeSwitcher page={{ ...GAME_PAGE, modes: MANY_MODES }} />
      </Demo>
      <Demo label="Headline table: Final and Normal over the kills rows, every stat opens its leaderboard at the player (the first hovered)" force="hover">
        <StatPanel section={HEADLINE} username={username} headline />
      </Demo>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Demo label="A titled section, the first stat focused" force="focus-visible">
          <StatPanel section={RESOURCES} username={username} />
        </Demo>
        <Demo label="A stat without a leaderboard: no link">
          <StatPanel section={{ title: null, rows: [[{ ...TOKENS, leaderboard: null }]] }} username={username} />
        </Demo>
        <Demo label="Hex colors, and a selection as a Label: value line">
          <StatPanel section={SELECTION_SECTION} username={username} />
        </Demo>
        <Demo label="The card's own heading, in its colors">
          <StatPanel section={{ ...RESOURCES, name: "§6Solo" }} username={username} />
        </Demo>
        <Demo label="A translated heading in the card's color">
          <StatPanel section={{ ...RESOURCES, color: "§b" }} username={username} />
        </Demo>
      </div>
      <Demo label="A list: the card's names, a time never set as N/A with no link">
        <StatPanel section={LIST_SECTION} username={username} />
      </Demo>
      <Demo label="A long list, folded behind its heading and count">
        <StatPanel section={{ ...LIST_SECTION, collapsed: true }} username={username} />
      </Demo>
      <Demo label="A folded list the page's filter searches, opened on its matches with their count">
        <StatPanel section={{ ...LIST_SECTION, collapsed: true, search: true }} username={username} filter="is" />
      </Demo>
      <Demo label="A list in the card's own formatting, bold only where the card is (titles)">
        <StatPanel section={TITLE_LIST} username={username} />
      </Demo>
    </Section>
  );
}

function SearchSection() {
  const client = useFixtureSearchClient();

  return (
    <QueryClientProvider client={client}>
      <Section id="search">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Demo label="Regular">
            <Search />
          </Demo>
          <Demo label="Compact">
            <Search compact />
          </Demo>
          <Demo label="With a value">
            <Search defaultValue="anrie" />
          </Demo>
          <Demo label="Disabled">
            <Search compact disabled />
          </Demo>
          <Demo label="Custom placeholder">
            <Search compact placeholder="Find a player on this leaderboard" />
          </Demo>
          <Demo label="Keyboard focus" force="focus-visible">
            <Search compact />
          </Demo>
          <Demo label="Open, with suggestions" className="min-h-96 lg:col-span-2">
            <Focused>
              <Search compact defaultValue="an" className="max-w-96" />
            </Focused>
          </Demo>
        </div>
      </Section>
    </QueryClientProvider>
  );
}

const minutes = (count: number) => count * 60_000;

// The refresh action's outcomes, without the API.
const ok = async (): Promise<ActionResult<unknown>> => ({ ok: true, data: null });
const limited = async (): Promise<ActionResult<unknown>> => ({ ok: false, code: "TOO_MANY_REQUESTS", retryAfter: 125 });
const failing = async (): Promise<ActionResult<unknown>> => {
  throw new Error("The gallery's refresh always fails");
};
const hanging = () => new Promise<ActionResult<unknown>>(() => {});

function RefreshSection() {
  // Built once, so the countdowns run against the clock the page loaded with.
  const [now] = useState(() => Date.now());

  return (
    <Section id="refresh">
      <div className="flex flex-col gap-6">
        <Demo label="Ready">
          <RefreshBar updatedAt={now - minutes(17)} expiresAt={now - minutes(15)} refresh={ok} />
        </Demo>
        <Demo label="Cooling down after an update">
          <RefreshBar updatedAt={now - 25_000} expiresAt={now + 95_000} refresh={ok} />
        </Demo>
        <Demo label="Updating">
          <AfterClick>
            <RefreshBar updatedAt={now - minutes(17)} expiresAt={now - minutes(15)} refresh={hanging} />
          </AfterClick>
        </Demo>
        <Demo label="Over the Hypixel budget">
          <AfterClick>
            <RefreshBar updatedAt={now - minutes(17)} expiresAt={now - minutes(15)} refresh={limited} />
          </AfterClick>
        </Demo>
        <Demo label="Failed">
          <AfterClick>
            <RefreshBar updatedAt={now - minutes(17)} expiresAt={now - minutes(15)} refresh={failing} />
          </AfterClick>
        </Demo>
      </div>
    </Section>
  );
}

function ResultSection() {
  return (
    <Section id="results">
      <Demo label="Cards, with and without a guild tag">
        <ResultCards cards={RESULT_CARDS} query="an" />
      </Demo>
      <Demo label="No results">
        <ResultCards cards={[]} query="qqqqqq" />
      </Demo>
    </Section>
  );
}

function LeaderboardSection() {
  return (
    <Section id="leaderboards">
      <Demo label="Rows: the top three, a highlighted row, a long name and nine digits">
        <LeaderboardTable page={LEADERBOARD_PAGE} />
      </Demo>
      <Demo label="Empty">
        <LeaderboardTable page={{ ...LEADERBOARD_PAGE, rows: [] }} />
      </Demo>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Demo label="Page nav, first page">
          <PageNav field={LEADERBOARD_PAGE.field} page={0} pages={LEADERBOARD_PAGE.pages} />
        </Demo>
        <Demo label="Page nav, last page">
          <PageNav field={LEADERBOARD_PAGE.field} page={LEADERBOARD_PAGE.pages - 1} pages={LEADERBOARD_PAGE.pages} />
        </Demo>
        <Demo label="Find a player">
          <FindPlayer field={LEADERBOARD_PAGE.field} />
        </Demo>
        <Demo label="Find a player: unknown and unranked">
          <div className="flex flex-col gap-4">
            <FindPlayer field={LEADERBOARD_PAGE.field} miss={{ kind: "unknown", name: "zzznotaplayer" }} />
            <FindPlayer field={LEADERBOARD_PAGE.field} miss={{ kind: "unranked", name: "oJakey" }} />
          </div>
        </Demo>
      </div>
    </Section>
  );
}

function HomeSection() {
  return (
    <Section id="home">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Demo label="Table cells">
          <div className="grid grid-cols-2 gap-2">
            <TableData title="Wins" value="2,904" color="text-mc-green" />
            <TableData title="WLR" value="2.41" color="text-mc-gold" />
          </div>
        </Demo>
        <Demo label="Sidebar">
          <Sidebar>
            <SidebarItem name="Tokens" value="1.2M" color="text-mc-dark-green" />
            <SidebarItem name="Iron" value="203,114" color="text-mc-gray" />
            <SidebarItem name="Gold" value="51,882" color="text-mc-gold" />
          </Sidebar>
        </Demo>
        <Demo label="Progression">
          <Progression label="Level" metric="EXP" progression={PROGRESSION} currentLevel="§6[412✫]" nextLevel="§6[413✫]" />
        </Demo>
        <Demo label="Nametag">
          <Nametag prefixName="§b[MVP§c+§b] anrie" />
        </Demo>
        <Demo label="Command chip">
          <p className="text-mc-1.5">
            Run <Command command="/bedwars" /> in any server.
          </p>
        </Demo>
        <Demo label="Tooltip, open">
          <div className="pt-12">
            <PopoverTooltip content="Copied to Clipboard!" open asChild>
              <button type="button" className="text-mc-1.5 underline">/session</button>
            </PopoverTooltip>
          </div>
        </Demo>
        <Demo label="Tabs" className="sm:col-span-2">
          <Tabs defaultTab="casual">
            <Tab tab="casual" className="min-w-0">Casual</Tab>
            <Tab tab="pvp" className="min-w-0">PvP</Tab>
            <Tab tab="classic" className="min-w-0">Classic</Tab>
          </Tabs>
        </Demo>
      </div>
      <Demo label="Carousel">
        <Carousel>
          <Box className="w-64">The first card</Box>
          <Box className="w-64">The second card</Box>
          <Box className="w-64">The third card</Box>
        </Carousel>
      </Demo>
    </Section>
  );
}

const ICONS = [Logo, LogoError, Board, Caret, Chevron, Discord, GitHub, Menu, Patreon, SearchIcon, Twitter, YouTube];

function MediaSection() {
  return (
    <Section id="media">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Demo label="Skin">
          <Skin uuid={ANRIE_UUID} className="h-64" />
        </Demo>
        <Demo label="Skin bust">
          <SkinBust uuid={OJAKEY_UUID} className="h-40 w-28" />
        </Demo>
        <Demo label="Heads at 24, 32 and 64">
          <div className="flex items-end gap-4">
            <SkinHead uuid={ANRIE_UUID} size={24} />
            <SkinHead uuid={ANRIE_UUID} size={32} />
            <SkinHead uuid={OJAKEY_UUID} size={64} />
          </div>
        </Demo>
        <Demo label="Wordmark and brand">
          <div className="flex flex-col gap-4">
            <Wordmark className="text-mc-2" />
            <Brand />
          </div>
        </Demo>
      </div>
      <Demo label="Game icons">
        <ul className="flex flex-wrap gap-2">
          {[...GAME_ICONS].filter(hasGameIcon).map((game) => (
            <li key={game}>
              <GameIcon game={game} />
            </li>
          ))}
        </ul>
      </Demo>
      <Demo label="Icons">
        <ul className="flex flex-wrap items-center gap-4">
          {ICONS.map((Icon) => (
            <li key={Icon.name}>
              <Icon className="size-8" />
            </li>
          ))}
        </ul>
      </Demo>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["general", "bedwars", "bingo"] as const).map((background) => (
          <Demo key={background} label={`Background: ${background}`}>
            <div className="relative h-40 overflow-hidden">
              <Background background={background} className="h-full" />
            </div>
          </Demo>
        ))}
      </div>
    </Section>
  );
}

function ErrorSection() {
  return (
    <Section id="errors">
      <Demo label="Not found">
        <div className="flex flex-col">
          <NotFound />
        </div>
      </Demo>
      <Demo label="Error, with Try again">
        <div className="flex flex-col">
          <ErrorPage error={new Error("The gallery's error")} reset={() => {}} />
        </div>
      </Demo>
    </Section>
  );
}

function NavigationSection() {
  return (
    <Section id="navigation">
      <Demo label="Progress bar, after a navigation has taken 300 ms (the page stays until the next one is ready)">
        <div className="relative h-11 bg-black/50">
          <ProgressBar label="Loading" className="absolute" />
        </div>
      </Demo>
    </Section>
  );
}
