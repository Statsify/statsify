/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BridgeDuels, BridgeDuelsMode } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";
import { prettify } from "@statsify/util";

interface BridgeDuelsModeColumnProps {
	stats: BridgeDuelsMode;
	title: string;
	t: LocalizeFunction;
}

const formatMode = (title: string) => prettify(title).replace("Ctf", "CTF");

const BridgeDuelsModeColumn = ({ title, stats, t }: BridgeDuelsModeColumnProps) => (
	<Table.ts title={`§b${formatMode(title)}`}>
		<Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
		<Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
		<Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
	</Table.ts>
);

export interface BridgeDuelsTableProps {
	stats: BridgeDuels;
	t: LocalizeFunction;
}

export const BridgeDuelsTable = ({ stats, t }: BridgeDuelsTableProps) => {
	const firstModes = ["overall", "solo", "doubles", "threes"] as const;
	const secondModes = ["fours", "2v2v2v2", "3v3v3v3", "ctf"] as const;

	return (
		<Table.table>
			<Table.tr>
				{firstModes.map((mode) => (
					<BridgeDuelsModeColumn title={mode} stats={stats[mode]} t={t} />
				))}
			</Table.tr>
			<Table.tr>
				{secondModes.map((mode) => (
					<BridgeDuelsModeColumn title={mode} stats={stats[mode]} t={t} />
				))}
			</Table.tr>
		</Table.table>
	);
};
