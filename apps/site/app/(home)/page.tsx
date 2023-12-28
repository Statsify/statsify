/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/box";
import { Search } from "~/components/search";

export default function Home() {
	return (
		<main className="h-full px-[5%] py-[1%]">
			<div className="flex h-1/2 items-end justify-center py-8">
				<Search className="w-full" />
			</div>
			<div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				<Player />
				<Player />
				<Player />
				<Player />
				<Player />
				<Player />
			</div>
		</main>
	);
}

function Player() {
	return (
		<Box className="flex gap-4 rounded-xl p-4">
			<div className="h-16 w-16 shrink-0 rounded-lg bg-red" />
			<div>
				<p className="text-2xl font-semibold">[MVP++] Amony [ΘREBLΘ]</p>
				<p>Network Level: 505.83</p>
				<p>Achievement Points: 15,000</p>
				<p>Quests: 10,530</p>
				<p>Quests: 10,530</p>
			</div>
		</Box>
	);
}
