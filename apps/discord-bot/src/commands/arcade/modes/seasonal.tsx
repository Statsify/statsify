/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { Seasonal } from "@statsify/schemas";
import { Table } from "#components";

interface SeasonalTableProps {
	stats: Seasonal;
	t: LocalizeFunction;
}

interface SeasonalGameTableProps {
	title: string;
	stats: [title: string, value: string, color: string][];
}

const SeasonalGameTable = ({ title, stats }: SeasonalGameTableProps) => (
	<Table.ts title={title}>
		{stats.map(([title, value, color]) => (
			<Table.td title={title} value={value} color={color} />
		))}
	</Table.ts>
);

export const SeasonalTable = ({ stats, t }: SeasonalTableProps) => (
	<Table.table>
		<Table.tr>
			<SeasonalGameTable
				title="§#e775b0E§#d88fa1a§#c9a991s§#bac382t§#abdd72e§#9dec6er §#91e780S§#85e292i§#78dca4m§#6cd7b6u§#74c9bel§#85b8c1a§#97a7c5t§#a895c8o§#ba84cbr"
				stats={[
					[t("stats.wins"), t(stats.easterSimulator.wins), "§d"],
					[t("stats.eggsFound"), t(stats.easterSimulator.eggsFound), "§e"],
				]}
			/>

			<SeasonalGameTable
				title="§#409384G§#4da995r§#59c0a6i§#66d6b7n§#7fe4c7c§#a5ebd7h §#ccf1e6S§#f2f8f6i§#e9c1c3m§#e08a90u§#d7535dl§#ca3541a§#b92f3dt§#a82838o§#972234r"
				stats={[
					[t("stats.wins"), t(stats.grinchSimulator.wins), "§a"],
					[t("stats.giftsFound"), t(stats.grinchSimulator.giftsFound), "§c"],
				]}
			/>
		</Table.tr>
		<Table.tr>
			<SeasonalGameTable
				title="§#f6921dH§#ea851ea§#de771fl§#d16a20l§#c55c21o§#b94f22w§#af4527e§#a94334e§#a34141n §#9e3f4fS§#983d5ci§#923b69m§#903b6eu§#903c70l§#903d72a§#903f73t§#904075o§#904177r"
				stats={[
					[t("stats.wins"), t(stats.halloweenSimulator.wins), "§6"],
					[t("stats.candyFound"), t(stats.halloweenSimulator.candyFound), "§5"],
				]}
			/>
			<SeasonalGameTable
				title="§#ed4f46S§#ef5855c§#f06165u§#f26b74b§#f37484a §#f48a96S§#f4a6a9i§#f3c3bcm§#f3dfcfu§#e0ebd9l§#a8d5d0a§#70c0c8t§#38aabfo§#0095b6r"
				stats={[
					[t("stats.wins"), t(stats.scubaSimulator.wins), "§e"],
					[t("stats.points"), t(stats.scubaSimulator.points), "§b"],
				]}
			/>
		</Table.tr>
	</Table.table>
);
