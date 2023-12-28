/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { ratio } from "@statsify/math";

export interface ProgressBarProps {
	color: string;
	numerator: number;
	denominator: number;
	t: LocalizeFunction;
}

export const ProgressBar = ({ color, numerator, denominator, t }: ProgressBarProps) => {
	const frac = `${t(numerator)}/${t(denominator)}`;

	const inner = <text>{frac}</text>;
	const percentage = Math.min(Math.floor(ratio(numerator, denominator, 100)), 100);
	const isHalf = percentage >= 50;

	return (
		<div width="100%">
			<box width="remaining" padding={0} shadowOpacity={0} color="#262626" location="left">
				<box width={`${percentage}%`} margin={0} padding={0} shadowOpacity={0} height="100%" color={color}>
					{isHalf ? inner : <></>}
				</box>
				{isHalf ? <></> : inner}
			</box>
			<text>{percentage}%</text>
		</div>
	);
};
