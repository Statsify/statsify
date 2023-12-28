/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CreeperAttack } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface CreeperAttackTableProps {
	stats: CreeperAttack;
	t: LocalizeFunction;
}

export const CreeperAttackTable = ({ stats, t }: CreeperAttackTableProps) => (
	<Table.table>
		<Table.tr>
			<Table.td title={t("stats.maxWave")} value={t(stats.maxWave)} color="§a" />
		</Table.tr>
	</Table.table>
);
