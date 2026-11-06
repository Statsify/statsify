/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, type CanvasRenderingContext2D, type Image, loadImage } from "skia-canvas";
import { GeneralProfile } from "../profiles/general.profile.js";
import { IMAGE_VARIANTS, type RenderRequest } from "./protocol.js";
import { SignatureProfile, UpdatedStamp } from "../profiles/signature.profile.js";
import { getBackground, getLogo } from "@statsify/assets";
import { getLocalizeFunction } from "./localize.js";
import { getTheme } from "../themes/index.js";
import { render } from "@statsify/rendering";
import type { Guild, Player } from "@statsify/schemas";

/** How far the `card` variant's stamp sits from the bottom-right corner, inside the card's footer. */
const STAMP_INSET = 18;

/**
 * Renders a player image for a site visitor (no premium user, so default theme and logo): the signature
 * laid out at its canvas size, or the bot's general card, on the variant's canvas. The result is drawn centred at
 * 1:1, which keeps the bitmap font sharp, over the same background; only an image that outgrew the canvas (a long
 * name, the guild row) shrinks to fit. `og` draws the card on the canvas's own background, so around a card smaller
 * than the canvas the background carries on rather than showing the card's edge. `card` gets the "Updated" stamp
 * in its footer's corner.
 */
export async function renderCard(request: RenderRequest): Promise<Uint8Array<ArrayBuffer>> {
  const { width, height } = IMAGE_VARIANTS[request.variant];

  const [t, background, logo, skin] = await Promise.all([
    getLocalizeFunction(),
    // The bot's `/general` backgrounds (`mapBackground(GENERAL_MODES, "overall")`), one per player: the UUID picks it, so a
    // re-render for the same `updatedAt` gives the same bytes.
    getBackground("hypixel", "overall", String(request.player.uuid)),
    getLogo(null),
    loadImage(Buffer.from(request.skin)),
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
