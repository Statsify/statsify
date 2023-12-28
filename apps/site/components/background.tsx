/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";

export function Background() {
	return (
		<Image
			src="/backgrounds/hypixel_overall_2.png"
			alt="background"
			fill
			className="absolute z-[-5] blur-lg brightness-75"
			style={{ objectFit: "cover" }}
		/>
	);
}
