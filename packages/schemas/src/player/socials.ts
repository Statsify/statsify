/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

export class PlayerSocials {
	@Field({ store: { required: false } })
	public discord?: string;
	@Field({ store: { required: false } })
	public forums?: string;

	@Field({ store: { required: false } })
	public instagram?: string;

	@Field({ store: { required: false } })
	public tiktok?: string;

	@Field({ store: { required: false } })
	public twitch?: string;

	@Field({ store: { required: false } })
	public twitter?: string;

	@Field({ store: { required: false } })
	public youtube?: string;

	public constructor(data: APIData) {
		this.discord = data.DISCORD;
		this.forums = data.HYPIXEL;
		this.instagram = data.INSTAGRAM;
		this.tiktok = data.TIKTOK;
		this.twitch = data.TWITCH;
		this.twitter = data.TWITTER;
		this.youtube = data.YOUTUBE;
	}
}
