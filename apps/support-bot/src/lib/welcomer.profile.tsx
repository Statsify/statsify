/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ordinal } from "@statsify/util";
import type { Image } from "skia-canvas";

export interface WelcomeProfileProps {
	username: string;
	avatar: Image;
	background: Image;
	memberCount: number;
}

export const WelcomeProfile = ({ username, avatar, background, memberCount }: WelcomeProfileProps) => (
	<img width="100%" height="100%" crop="resize" image={background}>
		<div width="95%" height="95%" direction="column" align="center">
			<div width="100%">
				<box padding={8}>
					<img image={avatar} width={96} height={96} />
				</box>
				<div direction="column" width="remaining">
					<box width="100%">
						<text>§^4^§6{username}</text>
					</box>
					<box width="100%">
						<text>§^4^§aWelcome to the Server!</text>
					</box>
				</div>
			</div>
			<div width="100%" height="remaining" direction="column">
				<box width="100%">
					<text>§fYou are the §e§l#{ordinal(memberCount)} §r§fmember</text>
				</box>
				<box width="100%" height="remaining">
					<text>§fRead §b#rules§f and enjoy your time §d:D</text>
				</box>
			</div>
		</div>
	</img>
);
