/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, BaseProfileProps, ModeEmoji, ProfileData } from "#commands/base.hypixel-command";
import { CHALLENGE_MODES, ChallengeModes, GameId, GameMode } from "@statsify/schemas";
import { ChallengesProfile } from "./challenges.profile.js";
import { Command } from "@statsify/discord";
import { Image } from "skia-canvas";
import { getAllGameIcons } from "@statsify/assets";

interface PreProfileData {
	gameIcons: Record<GameId, Image>;
}

@Command({ description: (t) => t("commands.challenges") })
export class ChallengesCommand extends BaseHypixelCommand<ChallengeModes, PreProfileData> {
	public constructor() {
		super(CHALLENGE_MODES);
	}

	public async getPreProfileData(): Promise<PreProfileData> {
		return { gameIcons: await getAllGameIcons() };
	}

	public getModeEmojis(modes: GameMode<ChallengeModes>[]): ModeEmoji[] {
		return modes.map((m) => m.api !== "overall" && ((t) => t(`emojis:games.${m.api}`)));
	}

	public getProfile(base: BaseProfileProps, { data, mode }: ProfileData<ChallengeModes, PreProfileData>): JSX.Element {
		return <ChallengesProfile {...base} mode={mode} gameIcons={data.gameIcons} />;
	}
}
