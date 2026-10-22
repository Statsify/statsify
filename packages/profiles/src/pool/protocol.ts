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

/**
 * The games whose bot card the pool draws for a site page's unfurl, by their `PlayerStats` key. A game joins once its
 * card lives in this package; the rest unfurl with the general card.
 */
export const GAME_CARDS = ["bedwars", "uhc", "speeduhc", "walls", "vampirez", "paintball", "quake", "turbokartracers", "buildbattle", "arenabrawl", "pit", "parkour", "skywars", "murdermystery", "copsandcrims"] as const;

export type GameCard = (typeof GAME_CARDS)[number];

/** Modes the bot draws on a card of their own, outside this package, so they unfurl with the general card too. */
const OWN_CARDS: Partial<Record<GameCard, string[]>> = { bedwars: ["challenges"] };

export const isGameCard = (game: string, mode: string): game is GameCard =>
  (GAME_CARDS as readonly string[]).includes(game) && !OWN_CARDS[game as GameCard]?.includes(mode);

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
};

/** The bot's general card, or a game's card in one of its api modes. */
export type CardChoice = { card: "general" } | { card: GameCard; mode: string };

/** The size of the image a card renders to in `variant`, which the page's `og:image:width` and `height` repeat. */
export const imageSize = (choice: CardChoice, variant: ImageVariant) =>
  variant === "og" && choice.card !== "general" ? GAME_CARD_SIZES[choice.card] : IMAGE_VARIANTS[variant];

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
