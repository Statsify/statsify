/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BountyHunters } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface BountyHuntersTableProps {
	stats: BountyHunters;
	t: LocalizeFunction;
}

export const BountyHuntersTable = ({ stats, t }: BountyHuntersTableProps) => (
	<Table.table>
		<Table.tr>
			<Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
			<Table.td title={t("stats.bountyKills")} value={t(stats.bountyKills)} color="§e" />
		</Table.tr>
		<Table.tr>
			<Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
			<Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
			<Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
		</Table.tr>
	</Table.table>
);
