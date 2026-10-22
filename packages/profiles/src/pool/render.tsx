/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArcadeProfile } from "../profiles/arcade/arcade.profile.js";
import { BlitzSGProfile } from "../profiles/blitzsg.profile.js";
import { CopsAndCrimsProfile } from "../profiles/copsandcrims.profile.js";
import { MegaWallsProfile } from "../profiles/megawalls.profile.js";
import { MurderMysteryProfile } from "../profiles/murdermystery.profile.js";
import { SkyWarsProfile } from "../profiles/skywars.profile.js";
import { TNTGamesProfile } from "../profiles/tntgames.profile.js";
import { WarlordsProfile } from "../profiles/warlords/warlords.profile.js";
import { WoolGamesProfile } from "../profiles/woolgames/woolgames.profile.js";
import {
  ARCADE_MODES,
  ARENA_BRAWL_MODES,
  BEDWARS_MODES,
  BLITZSG_MODES,
  BUILD_BATTLE_MODES,
  COPS_AND_CRIMS_MODES,
  type GameMode,
  type GameModes,
  type Guild,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PIT_MODES,
  type Player,
  QUAKE_MODES,
  SKYWARS_MODES,
  SPEED_UHC_MODES,
  TNT_GAMES_MODES,
  TURBO_KART_RACERS_MODES,
  UHC_MODES,
  VAMPIREZ_MODES,
  WALLS_MODES,
  WARLORDS_MODES,
  WOOLGAMES_MODES,
} from "@statsify/schemas";
import { ArenaBrawlProfile } from "../profiles/arenabrawl.profile.js";
import type { BaseProfileProps } from "../types.js";
import { BedWarsProfile } from "../profiles/bedwars.profile.js";
import { BuildBattleProfile } from "../profiles/buildbattle.profile.js";
import { Canvas, type CanvasRenderingContext2D, type Image, loadImage } from "skia-canvas";
import { type GameCard, type RenderRequest, imageSize } from "./protocol.js";
import { type GamesWithBackgrounds, mapBackground } from "../backgrounds.js";
import { GeneralProfile } from "../profiles/general.profile.js";
import { PaintballProfile } from "../profiles/paintball.profile.js";
import { ParkourProfile } from "../profiles/parkour.profile.js";
import { PitProfile } from "../profiles/pit.profile.js";
import { QuakeProfile } from "../profiles/quake.profile.js";
import { SignatureProfile, UpdatedStamp } from "../profiles/signature.profile.js";
import { SpeedUHCProfile } from "../profiles/speeduhc.profile.js";
import { TurboKartRacersProfile } from "../profiles/turbokartracers.profile.js";
import { UHCProfile } from "../profiles/uhc.profile.js";
import { VampireZProfile } from "../profiles/vampirez.profile.js";
import { WallsProfile } from "../profiles/walls.profile.js";
import { getAllGameIcons, getBackground, getLogo } from "@statsify/assets";
import { getLocalizeFunction } from "./localize.js";
import { getTheme } from "../themes/index.js";
import { render } from "@statsify/rendering";

/** How far the `card` variant's stamp sits from the bottom-right corner, inside the card's footer. */
const STAMP_INSET = 18;

/**
 * A game's card as its bot command draws it: the game's mode registry, what the command loads before it draws (its
 * `getPreProfileData`), and its `getProfile`, given the props every card takes, the mode and that data.
 */
interface CardSpec<T extends GamesWithBackgrounds, D> {
  modes: GameModes<T>;
  data?: () => Promise<D>;
  draw: (base: BaseProfileProps, extra: { mode: GameMode<T>; data: D }) => JSX.Element;
}

/** Types an entry by its own registry and data, then drops them so the table holds every game's. */
const card = <T extends GamesWithBackgrounds, D = undefined>(spec: CardSpec<T, D>) =>
  spec as unknown as CardSpec<GamesWithBackgrounds, unknown>;

/** Loads on the first call and keeps it for the worker's life, for what every render draws the same. */
const once = <T,>(load: () => Promise<T>) => {
  let loaded: Promise<T> | undefined;
  return () => (loaded ??= load());
};

const getGameIcons = once(getAllGameIcons);

/** The cards `GAME_CARDS` names. */
const CARDS: Record<GameCard, CardSpec<GamesWithBackgrounds, unknown>> = {
  bedwars: card({
    modes: BEDWARS_MODES,
    draw: (base, { mode }) => {
      if (mode.api === "challenges") throw new Error("BedWars' challenges have a card of their own");
      return <BedWarsProfile {...base} mode={mode} />;
    },
  }),
  uhc: card({ modes: UHC_MODES, draw: (base, { mode }) => <UHCProfile {...base} mode={mode} /> }),
  speeduhc: card({ modes: SPEED_UHC_MODES, draw: (base, { mode }) => <SpeedUHCProfile {...base} mode={mode} /> }),
  walls: card({ modes: WALLS_MODES, draw: (base) => <WallsProfile {...base} /> }),
  vampirez: card({ modes: VAMPIREZ_MODES, draw: (base, { mode }) => <VampireZProfile {...base} mode={mode} /> }),
  paintball: card({ modes: PAINTBALL_MODES, draw: (base) => <PaintballProfile {...base} /> }),
  quake: card({ modes: QUAKE_MODES, draw: (base, { mode }) => <QuakeProfile {...base} mode={mode} /> }),
  turbokartracers: card({ modes: TURBO_KART_RACERS_MODES, draw: (base) => <TurboKartRacersProfile {...base} /> }),
  buildbattle: card({ modes: BUILD_BATTLE_MODES, draw: (base) => <BuildBattleProfile {...base} /> }),
  arenabrawl: card({ modes: ARENA_BRAWL_MODES, draw: (base, { mode }) => <ArenaBrawlProfile {...base} mode={mode} /> }),
  pit: card({ modes: PIT_MODES, draw: (base) => <PitProfile {...base} /> }),
  parkour: card({
    modes: PARKOUR_MODES,
    data: async () => ({ gameIcons: await getGameIcons() }),
    draw: (base, { data }) => <ParkourProfile {...base} gameIcons={data.gameIcons} />,
  }),
  skywars: card({ modes: SKYWARS_MODES, draw: (base, { mode }) => <SkyWarsProfile {...base} mode={mode} /> }),
  murdermystery: card({ modes: MURDER_MYSTERY_MODES, draw: (base, { mode }) => <MurderMysteryProfile {...base} mode={mode} /> }),
  copsandcrims: card({ modes: COPS_AND_CRIMS_MODES, draw: (base, { mode }) => <CopsAndCrimsProfile {...base} mode={mode} /> }),
  arcade: card({ modes: ARCADE_MODES, draw: (base, { mode }) => <ArcadeProfile {...base} mode={mode} /> }),
  tntgames: card({ modes: TNT_GAMES_MODES, draw: (base, { mode }) => <TNTGamesProfile {...base} mode={mode} /> }),
  warlords: card({ modes: WARLORDS_MODES, draw: (base, { mode }) => <WarlordsProfile {...base} mode={mode} /> }),
  woolgames: card({ modes: WOOLGAMES_MODES, draw: (base, { mode }) => <WoolGamesProfile {...base} mode={mode} /> }),
  megawalls: card({ modes: MEGAWALLS_MODES, draw: (base, { mode }) => <MegaWallsProfile {...base} mode={mode} /> }),
  blitzsg: card({ modes: BLITZSG_MODES, draw: (base, { mode }) => <BlitzSGProfile {...base} mode={mode} /> }),
};

/**
 * The mode a request names as the bot's command hands it to the card, and the background the command draws it on. A
 * mode with submodes shows the one named, else its first, as the bot opens it.
 */
function cardMode(modes: GameModes<GamesWithBackgrounds>, api: string, submode?: string) {
  const mode = modes.getModes().find((candidate) => candidate.api === api);
  if (!mode) throw new Error(`There is no ${api} mode`);

  if (mode.submodes.length === 0) {
    return { mode: { ...mode, submode: undefined } as unknown as GameMode<GamesWithBackgrounds>, background: mapBackground(modes, mode.api) };
  }

  const sub = submode === undefined ? mode.submodes[0] : mode.submodes.find((candidate) => candidate.api === submode);
  if (!sub) throw new Error(`There is no ${api} ${submode} submode`);

  return {
    mode: { api: mode.api, formatted: mode.formatted, hypixel: mode.hypixel, submode: sub } as GameMode<GamesWithBackgrounds>,
    background: mapBackground(modes, mode.api, sub.api),
  };
}

/**
 * Renders a player image for a site visitor (no premium user, so default theme and logo): the signature
 * laid out at its canvas size, or one of the bot's cards (the general card, or a game's in one mode), on the canvas
 * `imageSize` gives. The result is drawn centred at 1:1, which keeps the bitmap font sharp, over the same
 * background; only an image that outgrew the canvas (a long name, the guild row) shrinks to fit. `og` draws the card
 * on the canvas's own background, so around a card smaller than the canvas the background carries on rather than
 * showing the card's edge. `card` gets the "Updated" stamp in its footer's corner.
 */
export async function renderCard(request: RenderRequest): Promise<Uint8Array<ArrayBuffer>> {
  const { width, height } = imageSize(request, request.variant);
  const uuid = String(request.player.uuid);
  const game =
    request.card === "general" ? undefined : { spec: CARDS[request.card], ...cardMode(CARDS[request.card].modes, request.mode, request.submode) };

  const [t, background, logo, skin, data] = await Promise.all([
    getLocalizeFunction(),
    // The backgrounds the bot draws the card on (`/general`'s are `mapBackground(GENERAL_MODES, "overall")`), one per
    // player: the UUID picks it, so a re-render for the same `updatedAt` gives the same bytes.
    game ? getBackground(...game.background, uuid) : getBackground("hypixel", "overall", uuid),
    getLogo(null),
    loadImage(Buffer.from(request.skin)),
    game?.spec.data?.(),
  ]);

  const player = request.player as unknown as Player;
  const guild = (request.guild as unknown as Guild | null) ?? undefined;
  const theme = getTheme(null);

  // A card's `Background` draws a canvas as it draws an image; the profiles' props only name the image type.
  const draw = (cardBackground: Image | Canvas) =>
    render(
      request.variant === "sig" ?
        (
          <SignatureProfile
            width={width}
            height={height}
            background={background}
            logo={logo}
            skin={skin}
            player={player}
            guild={guild}
            updatedAt={request.updatedAt}
            t={t}
          />
        ) :
        game ?
          game.spec.draw(
            { background: cardBackground as Image, logo, skin, player, user: null, t, time: "LIVE" },
            { mode: game.mode, data }
          ) :
          (
            <GeneralProfile
              background={cardBackground as Image}
              logo={logo}
              skin={skin}
              player={player}
              guild={guild}
              user={null}
              t={t}
              time="LIVE"
            />
          ),
      theme
    );

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");

  if (request.variant === "og") drawCover(ctx, background, width, height);

  let image = draw(request.variant === "og" ? canvas : background);

  // `og` hands the card the canvas's background, so its boxes blend with the pixels around them as on the bot's
  // card. The card crops what it's given to its own size, so one smaller than the canvas is drawn again on exactly
  // the part of the background it covers, which keeps its edge seamless.
  const x = Math.round((width - image.width) / 2);
  const y = Math.round((height - image.height) / 2);
  if (request.variant === "og" && x >= 0 && y >= 0 && (x > 0 || y > 0)) {
    const covered = new Canvas(image.width, image.height);
    covered.getContext("2d").drawImage(canvas, -x, -y);
    image = draw(covered);
  }

  // The bitmap font stays sharp only at 1:1 on whole pixels; an image that outgrew the canvas shrinks to fit.
  const scale = Math.min(width / image.width, height / image.height, 1);
  const imageWidth = Math.round(image.width * scale);
  const imageHeight = Math.round(image.height * scale);
  // The background shows only around a card smaller than the canvas; `og` drew it already, under the card.
  if (request.variant !== "og" && (imageWidth < width || imageHeight < height)) drawCover(ctx, background, width, height);
  ctx.drawImage(image, Math.round((width - imageWidth) / 2), Math.round((height - imageHeight) / 2), imageWidth, imageHeight);

  if (request.variant === "card") {
    const stamp = render(<UpdatedStamp updatedAt={request.updatedAt} t={t} />, theme);
    ctx.drawImage(stamp, width - stamp.width - STAMP_INSET, height - stamp.height - STAMP_INSET);
  }

  return new Uint8Array(await canvas.toBuffer("png"));
}

/** Draws `image` scaled to cover the canvas, centred. */
function drawCover(ctx: CanvasRenderingContext2D, image: Image, width: number, height: number) {
  const cover = Math.max(width / image.width, height / image.height);
  const coverWidth = image.width * cover;
  const coverHeight = image.height * cover;
  ctx.drawImage(image, (width - coverWidth) / 2, (height - coverHeight) / 2, coverWidth, coverHeight);
}
