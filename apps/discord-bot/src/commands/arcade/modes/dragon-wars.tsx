/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DragonWars } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface DragonWarsTableProps {
	stats: DragonWars;
	t: LocalizeFunction;
}

export const DragonWarsTable = ({ stats, t }: DragonWarsTableProps) => (
	<Table.table>
		<Table.tr>
			<Table.td title={t("stats.wins")} value={t(stats.wins)} color="§e" />
			<Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
			<Table.td title={t("stats.mounts")} value={t(stats.mounts)} color="§6" />
		</Table.tr>
	</Table.table>
);
