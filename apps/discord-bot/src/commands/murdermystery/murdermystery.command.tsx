/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, BaseProfileProps, ProfileData } from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { MURDER_MYSTERY_MODES, MurderMysteryModes } from "@statsify/schemas";
import { MurderMysteryProfile } from "./murdermystery.profile.js";

@Command({ description: (t) => t("commands.murdermystery") })
export class MurderMysteryCommand extends BaseHypixelCommand<MurderMysteryModes> {
	public constructor() {
		super(MURDER_MYSTERY_MODES);
	}

	public getProfile(base: BaseProfileProps, { mode }: ProfileData<MurderMysteryModes, never>): JSX.Element {
		return <MurderMysteryProfile {...base} mode={mode} />;
	}
}
