/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, BaseProfileProps } from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { TURBO_KART_RACERS_MODES, TurboKartRacersModes } from "@statsify/schemas";
import { TurboKartRacersProfile } from "./turbokartracers.profile.js";

@Command({ description: (t) => t("commands.turbokartracers") })
export class TurboKartRacersCommand extends BaseHypixelCommand<TurboKartRacersModes> {
	public constructor() {
		super(TURBO_KART_RACERS_MODES);
	}

	public getProfile(base: BaseProfileProps): JSX.Element {
		return <TurboKartRacersProfile {...base} />;
	}
}
