/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, If, Multiline, Table } from "#components";
import { FormattedGame, GameId, RecentGame } from "@statsify/schemas";
import { arrayGroup, relativeTime } from "@statsify/util";
import { mapGame } from "#constants";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { Image } from "skia-canvas";

export interface RecentGamesProfileProps extends Omit<BaseProfileProps, "player" | "time"> {
	recentGames: RecentGame[];
	prefixName: string;
	gameIcons: Record<GameId, Image>;
}

export const RecentGamesProfile = ({ prefixName, recentGames, skin, badge, background, logo, gameIcons, user, t }: RecentGamesProfileProps) => {
	const groups = arrayGroup(recentGames, 3);

	return (
		<Container background={background}>
			<Header name={prefixName} skin={skin} badge={badge} title="§l§ePlayer Recent Games" time="LIVE" />
			<Table.table>
				{groups.map((games) => (
					<Table.tr>
						{games.map(({ game, mode, map, startedAt, endedAt }) => (
							<box width="100%">
								<div width="remaining" direction="column" margin={4}>
									<text align="left" margin={2}>
										§l{FormattedGame[game.id]}
									</text>
									<Multiline align="left" margin={2}>
										{[
											`§7${t("stats.mode")}: §f${mode ? mapGame(game.id, mode) : "N/A"}`,
											`§7${t("stats.map")}: §f${map ?? "N/A"}`,
											`§7${t("stats.started")}: §f${relativeTime(startedAt)}`,
											`§7${t("stats.ended")}: §f${endedAt ? relativeTime(endedAt) : "N/A"}`,
										].join("\n")}
									</Multiline>
								</div>
								<If condition={gameIcons[game.id]}>
									{(icon) => (
										<div location="left" margin={{ top: 8, right: 4 }}>
											<img image={icon} width={32} height={32} />
										</div>
									)}
								</If>
							</box>
						))}
					</Table.tr>
				))}
			</Table.table>
			<Footer logo={logo} user={user} />
		</Container>
	);
};
