/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, Table } from "#components";
import { LocalizeFunction } from "@statsify/discord";
import { PVPBaseDuelsGameMode, UHCDuels } from "@statsify/schemas";
import { prettify } from "@statsify/util";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface UHCDuelsModeColumnProps {
	stats: PVPBaseDuelsGameMode;
	title: string;
	t: LocalizeFunction;
	time: ProfileTime;
}

const UHCDuelsModeColumn = ({ title, stats, t, time }: UHCDuelsModeColumnProps) => (
	<Table.ts title={`§6${prettify(title)}`}>
		<Historical.exclude time={time}>
			<Table.tr>
				<Table.td title={t("stats.winstreak")} value={t(stats.winstreak)} color="§e" size="small" />
				<Table.td title={t("stats.bestWinstreak")} value={t(stats.bestWinstreak)} color="§e" size="small" />
			</Table.tr>
		</Historical.exclude>
		<Table.tr>
			<Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" size="small" />
			<Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" size="small" />
		</Table.tr>
		<Table.tr>
			<Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" size="small" />
			<Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" size="small" />
		</Table.tr>
		<Table.tr>
			<Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" size="small" />
			<Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" size="small" />
		</Table.tr>
	</Table.ts>
);

export interface UHCDuelsTableProps {
	stats: UHCDuels;
	t: LocalizeFunction;
	time: ProfileTime;
}

export const UHCDuelsTable = ({ stats, t, time }: UHCDuelsTableProps) => {
	const topModes = ["overall", "solo"] as const;
	const bottomModes = ["doubles", "fours", "deathmatch"] as const;

	return (
		<Table.table>
			<Table.tr>
				{topModes.map((mode) => (
					<UHCDuelsModeColumn title={mode} stats={stats[mode]} t={t} time={time} />
				))}
			</Table.tr>
			<Table.tr>
				{bottomModes.map((mode) => (
					<UHCDuelsModeColumn title={mode} stats={stats[mode]} t={t} time={time} />
				))}
			</Table.tr>
		</Table.table>
	);
};
