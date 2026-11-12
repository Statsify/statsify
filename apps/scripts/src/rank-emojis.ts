/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FontRenderer, createCanvas } from "@statsify/rendering";
import { Logger } from "@statsify/logger";
import { RestClient } from "tiny-discord";
import { config, minecraftColors } from "@statsify/util";
import { getMinecraftTexturePath } from "@statsify/assets";
import { rankMap } from "@statsify/schemas";
import { writeFileSync } from "node:fs";

const COLOR_CHANGERS = ["MVP+", "MVP++", "bMVP++"];
const SIZE = 20;
const RANKS = Object.keys(rankMap).filter((rank) => !["DEFAULT"].includes(rank));
const EMOJI_LIMIT = 50;

export const ALPHABET = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const logger = new Logger("rank-emojis");

const token = await config("rankEmojis.botToken", { required: false });

if (!token) {
  logger.error(
    "Add a discord bot token to create the emoji servers in the RANK_EMOJI_DISCORD_BOT_TOKEN field in the .env"
  );

  process.exit(1);
}

const renderer = new FontRenderer(false);
await renderer.loadImages(getMinecraftTexturePath("textures/font"));

interface Emoji {
  buffer: string;
  rank: string;
  category?: string;
  index: number;
  name: string;
}

const emojis: Emoji[] = [];

const drawRank = async (formatted: string) => {
  const nodes = renderer.lex(formatted);
  const { width, height } = renderer.measureText(nodes);

  const textCanvas = createCanvas(width, height);
  const textCtx = textCanvas.getContext("2d");
  renderer.fillText(textCtx, nodes, 0, 0);

  const imageCount = Math.ceil(width / SIZE);
  const images = await Promise.all(Array.from({ length: imageCount }).map((_, x) => {
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(textCanvas, SIZE * x, 0, SIZE, SIZE, 0, 0, SIZE, SIZE);
    return canvas.toDataURL("png");
  }));

  return images;
};

/**
 * @param prefixIndex the first letter of the emoji on discord
 */
const drawColorChanger = async (rank: string, prefixIndex: string) => {
  const color0 = await drawRank(rankMap[rank](minecraftColors[0].code));
  const color1 = await drawRank(rankMap[rank](minecraftColors[1].code));

  const sharedImages: Record<number, string> = {};

  for (const [i, img] of color0.entries()) {
    if (img === color1[i]) sharedImages[i] = img;
  }

  const remainingColors = [...minecraftColors].splice(2, minecraftColors.length);

  const coloredEmojis = [
    color0,
    color1,
    ...(await Promise.all(
      remainingColors.map((color) => drawRank(rankMap[rank](color.code)))
    )),
  ];

  for (const [index, image] of Object.entries(sharedImages).entries()) {
    emojis.push({
      // @ts-expect-error this pushes the [key, image] pair
      buffer: image,
      rank,
      category: "SHARED",
      index,
      name: `${prefixIndex}${index}`,
    });
  }

  for (const [index, images] of coloredEmojis) {
    // @ts-expect-error missing entries(), so index is an image
    const color = minecraftColors[index];

    // @ts-expect-error images is a string
    for (const [i, image] of images.entries()) {
      if (sharedImages[i]) continue;

      emojis.push({
        buffer: image,
        rank,
        category: color.id,
        index: i,
        name: `${prefixIndex}${color.code[1]}${i}`,
      });
    }
  }
};

/**
 * @param prefixIndex the first letter of the emoji on discord
 */
const drawNonColorChanger = async (rank: string, prefixIndex: string) => {
  const images = await drawRank(rankMap[rank](""));

  for (const [index, image] of images.entries()) {
    emojis.push({ buffer: image, rank, index, name: `${prefixIndex}${index}` });
  }
};

// Create all the emojis
await Promise.all(
  RANKS.map(async (rank, index) => {
    const prefixIndex = ALPHABET[index];

    if (COLOR_CHANGERS.includes(rank)) return drawColorChanger(rank, prefixIndex);
    return drawNonColorChanger(rank, prefixIndex);
  })
);

const serverCount = Math.ceil(emojis.length / EMOJI_LIMIT);

logger.debug(`Creating ${serverCount} servers`);
logger.debug(`Creating ${emojis.length} emojis`);

const rankEmotes: Record<string, string[]> = {};
const colorChangerEmotes: Record<string, Record<string, Record<number, string>>> = {};

const client = new RestClient({ token });

// For ratelimiting purposes it is better to run these requests serially
for (let i = 0; i < serverCount; i++) {
  // oxlint-disable-next-line no-await-in-loop
  const guild = await client
    .post("/guilds", { name: `Statsify Ranks ${i + 1}` })
    .then((res) => res.body.json);

  const channel = guild.system_channel_id;

  // oxlint-disable-next-line no-await-in-loop
  const invite = await client
    .post(`/channels/${channel}/invites`, { type: 1 })
    .then((res) => res.body.json);

  logger.log(`Created guild ${guild.id} with invite: discord.gg/${invite.code}`);

  for (let j = 0; j < EMOJI_LIMIT; j++) {
    const index = i * EMOJI_LIMIT + j;
    if (index >= emojis.length) break;

    const emoji = emojis[index];

    // oxlint-disable-next-line no-await-in-loop
    const emojiResolved = await client
      .post(`/guilds/${guild.id}/emojis`, {
        name: emoji.name,
        image: emoji.buffer,
        roles: [],
      })
      .then((res) => res.body.json);

    const emote = `<:${emojiResolved.name}:${emojiResolved.id}>`;

    if (COLOR_CHANGERS.includes(emoji.rank)) {
      const categories = (colorChangerEmotes[emoji.rank] ??= {});
      (categories[emoji.category!] ??= {})[emoji.index] = emote;
    } else {
      (rankEmotes[emoji.rank] ??= [])[emoji.index] = emote;
    }
  }
}

const json: Record<string, string> = {};

for (const [rank, emotes] of Object.entries(rankEmotes)) {
  json[rank] = emotes.join("");
}

for (const rank of COLOR_CHANGERS) {
  for (const color of minecraftColors) {
    const body: Record<string, string> = {
      ...colorChangerEmotes[rank]["SHARED"],
      ...colorChangerEmotes[rank][color.id],
    };

    json[`${rank}_${color.id}`] = Object.keys(body)
      .sort()
      .map((key) => body[key])
      .filter(Boolean)
      .join("");
  }
}

writeFileSync("../discord-bot/emojis.json", JSON.stringify(json, null, 2));
