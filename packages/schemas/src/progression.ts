/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { ratio } from "@statsify/math";

export class Progression {
	@Field({ leaderboard: { enabled: false } })
	public current: number;

	@Field({ leaderboard: { enabled: false } })
	public max?: number;

	@Field({ leaderboard: { enabled: false } })
	public percent: number;

	public constructor(current: number, max: number) {
		this.current = current || 0;

		if (max) {
			this.max = max;
			this.percent = ratio(current, max);
		} else {
			this.percent = 1;
		}
	}
}
