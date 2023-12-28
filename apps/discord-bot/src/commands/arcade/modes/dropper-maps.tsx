/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Dropper, DropperMaps, MetadataScanner } from "@statsify/schemas";
import { Table } from "#components";
import { arrayGroup, formatRaceTime } from "@statsify/util";
import type { LocalizeFunction } from "@statsify/discord";

// This will return the leaderboard names for each dropper map, we only want the map names
const DROPPER_MAPS = MetadataScanner.scan(DropperMaps)
	.filter(([key]) => key.endsWith(".bestTime"))
	.map(([key, metadata]) => [key.replace(".bestTime", ""), metadata.leaderboard.name.replace(" Best Time", "")] as [keyof DropperMaps, string])
	.sort(([a], [b]) => a.localeCompare(b));

const HARD_DROPPER_MAP_GROUPS = arrayGroup(
	DROPPER_MAPS.filter(([_, name]) => name.startsWith("§c")),
	4
);
const MEDIUM_DROPPER_MAP_GROUPS = arrayGroup(
	DROPPER_MAPS.filter(([_, name]) => name.startsWith("§e")),
	4
);
const EASY_DROPPER_MAP_GROUPS = arrayGroup(
	DROPPER_MAPS.filter(([_, name]) => name.startsWith("§a")),
	4
);

interface DropperMapsTableProps {
	dropper: Dropper;
	t: LocalizeFunction;
	stat: "bestTime" | "completions";
}

export const DropperMapsTable = ({ dropper, t, stat }: DropperMapsTableProps) => (
	<Table.table>
		<Table.ts title="§cHard">
			{HARD_DROPPER_MAP_GROUPS.map((group) => (
				<DropperMapGroup dropper={dropper} group={group} stat={stat} t={t} />
			))}
		</Table.ts>
		<Table.ts title="§eMedium">
			{MEDIUM_DROPPER_MAP_GROUPS.map((group) => (
				<DropperMapGroup dropper={dropper} group={group} stat={stat} t={t} />
			))}
		</Table.ts>
		<Table.ts title="§aEasy">
			{EASY_DROPPER_MAP_GROUPS.map((group) => (
				<DropperMapGroup dropper={dropper} group={group} stat={stat} t={t} />
			))}
		</Table.ts>
	</Table.table>
);

interface DropperMapGroupProps extends DropperMapsTableProps {
	group: [keyof DropperMaps, string][];
}

const DropperMapGroup = ({ dropper, group, stat, t }: DropperMapGroupProps) => (
	<Table.tr>
		{group.map(([key, mapName]) => {
			const map = dropper.maps[key];

			let value;

			switch (stat) {
				case "bestTime":
					value = map.bestTime === 0 ? "§7N/A" : formatRaceTime(map.bestTime);
					break;
				case "completions":
					value = t(map.completions);
					break;
			}

			return (
				<box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
					<text>§l{mapName}</text>
					<div width="remaining" margin={{ left: 2, right: 2 }} />
					<text>{value}</text>
				</box>
			);
		})}
	</Table.tr>
);
