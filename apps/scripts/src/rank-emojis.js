/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas } from "skia-canvas";
import { FontRenderer } from "@statsify/rendering";
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

const token = config("rankEmojis.botToken");

if (!token) {
	logger.error("Add a discord bot token to create the emoji servers in the RANK_EMOJI_DISCORD_BOT_TOKEN field in the .env");

	process.exit(1);
}

const renderer = new FontRenderer();
await renderer.loadImages(getMinecraftTexturePath("textures/font"));

const emojis = [];

/**
 *
 * @param {string} formatted
 * @returns {Promise<string[]>}
 */
const drawRank = async (formatted) => {
	const nodes = renderer.lex(formatted);
	const { width, height } = renderer.measureText(nodes);

	const textCanvas = new Canvas(width, height);
	const textCtx = textCanvas.getContext("2d");
	renderer.fillText(textCtx, nodes, 0, 0);

	const imageCount = Math.ceil(width / SIZE);
	const images = [];

	for (let x = 0; x < imageCount; x++) {
		const canvas = new Canvas(SIZE, SIZE);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(textCanvas, SIZE * x, 0, SIZE, SIZE, 0, 0, SIZE, SIZE);
		images.push(await canvas.toDataURL("png"));
	}

	return images;
};

/**
 *
 * @param {string} rank the rank to draw
 * @param {string} prefixIndex the first letter of the emoji on discord
 */
const drawColorChanger = async (rank, prefixIndex) => {
	const color0 = await drawRank(rankMap[rank](minecraftColors[0].code));
	const color1 = await drawRank(rankMap[rank](minecraftColors[1].code));

	const sharedImages = {};

	for (const [i, img] of color0.entries()) {
		if (img === color1[i]) sharedImages[i] = img;
	}

	const remainingColors = [...minecraftColors].splice(2, minecraftColors.length);

	const coloredEmojis = [color0, color1, ...(await Promise.all(remainingColors.map((color) => drawRank(rankMap[rank](color.code)))))];

	Object.entries(sharedImages).forEach(([index, image]) => {
		emojis.push({
			buffer: image,
			rank,
			category: "SHARED",
			index,
			name: `${prefixIndex}${index}`,
		});
	});

	coloredEmojis.forEach(async (images, index) => {
		const color = minecraftColors[index];

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
	});
};

/**
 *
 * @param {string} rank the rank to draw
 * @param {string} prefixIndex the first letter of the emoji on discord
 */
const drawNonColorChanger = async (rank, prefixIndex) => {
	const images = await drawRank(rankMap[rank]());

	images.forEach((image, index) => {
		emojis.push({ buffer: image, rank, index, name: `${prefixIndex}${index}` });
	});
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

const json = {};

const client = new RestClient({ token });

for (let i = 0; i < serverCount; i++) {
	const guild = await client.post("/guilds", { name: `Statsify Ranks ${i + 1}` }).then((res) => res.body.json);

	const channel = guild.system_channel_id;

	const invite = await client.post(`/channels/${channel}/invites`, { type: 1 }).then((res) => res.body.json);

	logger.log(`Created guild ${guild.id} with invite: discord.gg/${invite.code}`);

	for (let j = 0; j < EMOJI_LIMIT; j++) {
		const index = i * EMOJI_LIMIT + j;
		if (index >= emojis.length) break;

		const emoji = emojis[index];

		const emojiResolved = await client
			.post(`/guilds/${guild.id}/emojis`, {
				name: emoji.name,
				image: emoji.buffer,
				roles: [],
			})
			.then((res) => res.body.json);

		const isColorChanger = COLOR_CHANGERS.includes(emoji.rank);

		json[emoji.rank] = json[emoji.rank] || (isColorChanger ? {} : []);

		const emote = `<:${emojiResolved.name}:${emojiResolved.id}>`;

		if (isColorChanger) {
			json[emoji.rank][emoji.category] = json[emoji.rank][emoji.category] || {};
			json[emoji.rank][emoji.category][emoji.index] = emote;
		} else {
			json[emoji.rank][emoji.index] = emote;
		}
	}
}

RANKS.filter((rank) => !COLOR_CHANGERS.includes(rank)).forEach((rank) => {
	json[rank] = json[rank].join("");
});

COLOR_CHANGERS.forEach((rank) => {
	minecraftColors.forEach((color) => {
		const body = {
			...json[rank]["SHARED"],
			...json[rank][color.id],
		};

		json[`${rank}_${color.id}`] = Object.keys(body)
			.sort()
			.map((key) => body[key])
			.filter(Boolean)
			.join("");
	});

	delete json[rank];
});

writeFileSync("../discord-bot/emojis.json", JSON.stringify(json, null, 2));
