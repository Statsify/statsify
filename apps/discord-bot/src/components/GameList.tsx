/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame, GameId } from "@statsify/schemas";
import { Image } from "skia-canvas";
import { Table } from "./Table/index.js";
import { arrayGroup } from "@statsify/util";
import type { Box } from "@statsify/rendering";

export type GameEntry = [GameId, string] | [GameId, string, Box.BoxProps | Box.BoxRenderProps];

export interface GameListProps {
	gameIcons: Record<GameId, Image>;
	entries: GameEntry[];
	rowSize?: number;
}

export const GameList = ({ gameIcons, entries, rowSize = 2 }: GameListProps) => {
	const values = entries.map(([field, value, boxProps]) => (
		<box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }} {...boxProps}>
			<img image={gameIcons[field as keyof typeof gameIcons]} width={32} height={32} />
			<text>§l{FormattedGame[field as keyof typeof FormattedGame] ?? field}</text>
			<div width="remaining" margin={{ left: 4, right: 4 }} />
			<text>{value}</text>
		</box>
	));

	const groups = arrayGroup(values, rowSize);

	return (
		<Table.table>
			{groups.map((group) => (
				<Table.tr>{group}</Table.tr>
			))}
		</Table.table>
	);
};
