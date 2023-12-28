/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Football } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface FootballTableProps {
	stats: Football;
	t: LocalizeFunction;
}

export const FootballTable = ({ stats, t }: FootballTableProps) => (
	<Table.table>
		<Table.tr>
			<Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
			<Table.td title={t("stats.goals")} value={t(stats.goals)} color="§b" />
		</Table.tr>
		<Table.tr>
			<Table.td title={t("stats.kicks")} value={t(stats.kicks)} color="§e" />
			<Table.td title={t("stats.powerKicks")} value={t(stats.powerKicks)} color="§6" />
		</Table.tr>
	</Table.table>
);
