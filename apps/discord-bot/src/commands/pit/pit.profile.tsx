/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Historical, SidebarItem, Table, formatProgression } from "#components";
import { FormattedGame } from "@statsify/schemas";
import { formatTime } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export const PitProfile = ({ background, logo, skin, t, badge, user, player, time }: BaseProfileProps) => {
	const { pit } = player.stats;

	const sidebar: SidebarItem[] = [
		[t("stats.gold"), t(pit.gold), "§6"],
		[t("stats.contracts"), t(pit.contractsCompleted), "§a"],
		[t("stats.renown"), t(pit.renown), "§e"],
		[t("stats.bounty"), t(pit.bounty), "§6"],
	];

	return (
		<Container background={background}>
			<Header
				name={player.prefixName}
				skin={skin}
				time={time}
				title={`§l${FormattedGame.PIT} §fStats`}
				description={`§7${t("stats.level")}: ${pit.levelFormatted}\n${formatProgression({
					t,
					label: t("stats.progression.exp"),
					progression: pit.progression,
					currentLevel: pit.levelFormatted,
					nextLevel: pit.nextLevelFormatted,
					showLevel: true,
				})}`}
				sidebar={sidebar}
				badge={badge}
			/>
			<Table.table>
				<Table.tr>
					<Table.td title={t("stats.kills")} value={t(pit.kills)} color="§a" />
					<Table.td title={t("stats.deaths")} value={t(pit.deaths)} color="§c" />
					<Table.td title={t("stats.kdr")} value={t(pit.kdr)} color="§6" />
				</Table.tr>
				<Table.tr>
					<Historical.exclude time={time}>
						<Table.td title={t("stats.highestStreak")} value={t(pit.highestStreak)} color="§d" />
					</Historical.exclude>

					<Table.td title={t("stats.playtime")} value={formatTime(pit.playtime)} color="§b" />
					<Table.td title={t("stats.assists")} value={t(pit.assists)} color="§e" />
				</Table.tr>
			</Table.table>
			<Historical.progression
				time={time}
				progression={pit.progression}
				current={pit.levelFormatted}
				next={pit.nextLevelFormatted}
				t={t}
				level={pit.trueLevel}
				exp={pit.exp}
			/>
			<Footer logo={logo} user={user} />
		</Container>
	);
};
