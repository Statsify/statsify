/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { MiniWalls } from "@statsify/schemas";
import { Table } from "#components";
import { prettify } from "@statsify/util";

interface MiniWallsTableProps {
	stats: MiniWalls;
	t: LocalizeFunction;
}

export const MiniWallsTable = ({ stats, t }: MiniWallsTableProps) => (
	<Table.table>
		<Table.tr>
			<Table.td title={t("stats.finalKills")} value={t(stats.finalKills)} color="§a" />
			<Table.td title={t("stats.wins")} value={t(stats.wins)} color="§e" />
			<Table.td title={t("stats.kit")} value={prettify(stats.kit)} color="§b" />
		</Table.tr>
		<Table.tr>
			<Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
			<Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
			<Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
		</Table.tr>
		<Table.tr>
			<Table.td title={t("stats.witherKills")} value={t(stats.witherKills)} color="§#417286" />
			<Table.td title={t("stats.witherDamage")} value={t(stats.witherDamage)} color="§#0668af" />
		</Table.tr>
	</Table.table>
);
