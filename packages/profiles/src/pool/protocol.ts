/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * The image sizes the site serves. `og` is the unfurl: the general card at its own size with the guild row, as the
 * bot sends it, rather than framed (a game's card has its own, `GAME_CARD_SIZES`). `sig` is a forum signature (the
 * Hypixel Forums cut signatures off at 200 px tall) and `card` the general card at its native size. The variant is
 * part of every request and cache key.
 */
export const IMAGE_VARIANTS = {
  og: { width: 808, height: 540 },
  sig: { width: 600, height: 200 },
  card: { width: 808, height: 540 },
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;

/** The games whose bot card the pool draws for a site page's unfurl, by their `PlayerStats` key. */
export const GAME_CARDS = ["bedwars", "uhc", "speeduhc", "walls", "vampirez", "paintball", "quake", "turbokartracers", "buildbattle", "arenabrawl", "pit", "parkour", "skywars", "murdermystery", "copsandcrims", "arcade", "tntgames", "warlords", "woolgames", "megawalls", "blitzsg", "smashheroes", "duels", "quests", "challenges"] as const;

export type GameCard = (typeof GAME_CARDS)[number];

/**
 * Whether the pool draws a page's own card: a game in `GAME_CARDS`, but not a game's all-time Quests (`period` is
 * Quests', all time when absent), which the card fails on as the bot's `/quests overall` does.
 */
export const isGameCard = (game: string, mode: string, period?: string): game is GameCard =>
  (GAME_CARDS as readonly string[]).includes(game) &&
  !(game === "quests" && mode !== "overall" && (period ?? "overall") === "overall");

/**
 * A game card's unfurl size. The card's own size depends on what it shows (BedWars is 847 to 870 px wide with the
 * numbers, and 25 px taller with a winstreak row), so this is the largest seen: a smaller card gets more of its
 * background around it, and a larger one shrinks to fit.
 */
export const GAME_CARD_SIZES: Record<GameCard, { width: number; height: number }> = {
  bedwars: { width: 870, height: 623 },
  uhc: { width: 773, height: 414 },
  speeduhc: { width: 812, height: 414 },
  walls: { width: 633, height: 414 },
  vampirez: { width: 759, height: 324 },
  paintball: { width: 763, height: 605 },
  quake: { width: 736, height: 505 },
  turbokartracers: { width: 841, height: 414 },
  buildbattle: { width: 837, height: 540 },
  arenabrawl: { width: 779, height: 605 },
  pit: { width: 808, height: 414 },
  parkour: { width: 792, height: 641 },
  skywars: { width: 784, height: 505 },
  murdermystery: { width: 1103, height: 596 },
  copsandcrims: { width: 845, height: 505 },
  arcade: { width: 1064, height: 698 },
  tntgames: { width: 872, height: 414 },
  warlords: { width: 808, height: 749 },
  woolgames: { width: 891, height: 812 },
  megawalls: { width: 874, height: 509 },
  blitzsg: { width: 709, height: 513 },
  smashheroes: { width: 845, height: 328 },
  duels: { width: 1126, height: 687 },
  quests: { width: 722, height: 732 },
  challenges: { width: 971, height: 691 },
};

/** Modes the bot draws on a card of their own, at that card's size: BedWars' challenges. */
const MODE_CARD_SIZES: Partial<Record<GameCard, Record<string, { width: number; height: number }>>> = {
  bedwars: { challenges: { width: 1033, height: 790 } },
};

/**
 * The bot's general card, or a game's card in one of its api modes, and in one of the mode's submodes where the site
 * has the bot's (a mode the bot splits and the site doesn't shows its first, as the bot opens it), and for Quests in
 * the page's period (all time when absent), over the dates the page gives its counts (`window`, ms).
 */
export type CardChoice =
  | { card: "general" }
  | { card: GameCard; mode: string; submode?: string; period?: string; window?: { start: number; end: number } };

/** The card a game page unfurls with: its game's, in its mode, submode and period, or the general one. */
export const pageCard = (page: {
  game: { key: string };
  mode: string;
  submode: string | null;
  period?: string;
  window?: { start: number; end: number };
}): CardChoice =>
  isGameCard(page.game.key, page.mode, page.period) ?
    {
      card: page.game.key,
      mode: page.mode,
      ...(page.submode !== null && { submode: page.submode }),
      ...(page.period !== undefined && { period: page.period }),
      ...(page.window && { window: page.window }),
    } :
    { card: "general" };

/** The size of the image a card renders to in `variant`, which the page's `og:image:width` and `height` repeat. */
export const imageSize = (choice: CardChoice, variant: ImageVariant) =>
  variant === "og" && choice.card !== "general" ?
    (MODE_CARD_SIZES[choice.card]?.[choice.mode] ?? GAME_CARD_SIZES[choice.card]) :
    IMAGE_VARIANTS[variant];

/** One card render, posted from the site to a worker. Documents are the API's JSON (`player.full`). */
export type RenderRequest = CardChoice & {
  variant: ImageVariant;
  player: Record<string, unknown>;
  guild: Record<string, unknown> | null;
  /** When the stats were fetched (ms); `sig` and `card` print it, so a forum reader sees how old they are. */
  updatedAt: number;
  /** The full-body skin render as PNG bytes; the worker never talks to the API. */
  skin: Uint8Array;
};

export type WorkerRequest = RenderRequest & { id: number };

export type WorkerMessage =
  | { type: "ready" }
  | { type: "done"; id: number; png: Uint8Array<ArrayBuffer> }
  | { type: "error"; id: number; message: string };
