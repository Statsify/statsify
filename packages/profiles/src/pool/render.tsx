/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, type Image, loadImage } from "skia-canvas";
import { GeneralProfile } from "../profiles/general.profile.js";
import { IMAGE_VARIANTS, type RenderRequest } from "./protocol.js";
import { getBackground, getLogo } from "@statsify/assets";
import { getLocalizeFunction } from "./localize.js";
import { getTheme } from "../themes/index.js";
import { render } from "@statsify/rendering";
import type { Guild, Player } from "@statsify/schemas";

/**
 * Renders the bot's general card for a site visitor (no premium user, so default theme and logo), then draws it
 * centred at 1:1, which keeps the bitmap font sharp, on the variant's canvas over the same background; only a card
 * that outgrew the canvas shrinks to fit. The card is drawn on the canvas's own background, so around a card smaller
 * than the canvas (one without the guild row) the background carries on rather than showing the card's edge.
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

  // A card's `Background` draws a canvas as it draws an image; the profile's props only name the image type.
  const draw = (cardBackground: Image | Canvas) =>
    render(
      <GeneralProfile
        background={cardBackground as Image}
        logo={logo}
        skin={skin}
        player={player}
        guild={guild}
        user={null}
        t={t}
        time="LIVE"
      />,
      getTheme(null)
    );

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");

  const cover = Math.max(width / background.width, height / background.height);
  const coverWidth = background.width * cover;
  const coverHeight = background.height * cover;
  ctx.drawImage(background, (width - coverWidth) / 2, (height - coverHeight) / 2, coverWidth, coverHeight);

  let card = draw(canvas);

  // The card gets the canvas's background, so its boxes blend with the pixels around them as on the bot's card. It
  // crops what it's given to its own size, so one smaller than the canvas is drawn again on exactly the part of the
  // background it covers, which keeps its edge seamless.
  const x = Math.round((width - card.width) / 2);
  const y = Math.round((height - card.height) / 2);
  if (x >= 0 && y >= 0 && (x > 0 || y > 0)) {
    const covered = new Canvas(card.width, card.height);
    covered.getContext("2d").drawImage(canvas, -x, -y);
    card = draw(covered);
  }

  // The bitmap font stays sharp only at 1:1 on whole pixels; a card that outgrew the canvas shrinks to fit.
  const scale = Math.min(width / card.width, height / card.height, 1);
  const cardWidth = Math.round(card.width * scale);
  const cardHeight = Math.round(card.height * scale);
  ctx.drawImage(card, Math.round((width - cardWidth) / 2), Math.round((height - cardHeight) / 2), cardWidth, cardHeight);

  return new Uint8Array(await canvas.toBuffer("png"));
}
