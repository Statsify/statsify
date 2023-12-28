/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import { Box } from "~/components/box";
import { RankChip } from "~/components/rank-chip";
import { Search } from "~/components/search";

export default function Home() {
	return (
		<main className="flex grow flex-col items-center justify-center gap-10 px-[2%] py-10">
			<h1 className="text-3xl font-bold text-white md:text-5xl">Search your Hypixel stats</h1>
			<Search className="w-full" />
			<div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
				<Player name="j4cobi" />
				<Player name="Amony" />
				<Player name="ugcodrr" />
				<Player name="imconnorngl" />
				<Player name="vnmm" />
				<Player name="anoxysm" />
			</div>
		</main>
	);
}

function Player({ name }) {
	return (
		<Box className="flex items-center gap-4 rounded-3xl px-2">
			<Image src="/skin.png" width={175} height={200} alt="Skin" className="shrink-0 pr-2" />
			<div className="flex flex-col gap-4 overflow-hidden py-4">
				<div className="flex flex-row items-center justify-start gap-2">
					<div className="shrink-0">
						<RankChip rank="MVP++" rankColor="GOLD" plusColor="DARK_RED" size="md" />
					</div>
					<p className="truncate text-2xl font-bold">{name}</p>
				</div>
				<div className="flex flex-col gap-0.5">
					<p className="text-xl">
						Achievement Points: <span className="font-semibold text-gold">23,385</span>
					</p>
					<p className="text-xl">
						Quests: <span className="font-semibold text-green">10,530</span>
					</p>
					<p className="text-xl">
						Karma: <span className="font-semibold text-light-purple">67,822,095</span>
					</p>
				</div>
			</div>
		</Box>
	);
}
