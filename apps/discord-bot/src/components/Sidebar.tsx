/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export type SidebarItem = [title: string, value: string, color: string];

export interface SidebarProps {
	items: SidebarItem[];
}

/**
 *
 * @example
 * ```ts
 * <Sidebar items=[
 *  [t('stats.coins'), t(stats.coins), '§6'],
 *  [t('stats.lootChests'), t(stats.lootChests), '§e']
 * ] />
 * ```
 */
export const Sidebar = ({ items }: SidebarProps) => (
	<box direction="column" height="100%" padding={{ left: 0, right: 0, top: 5, bottom: 5 }}>
		{items.map(([title, value, color]) => (
			<div>
				<text margin={{ top: 2, bottom: 2, left: 10, right: 2 }}>{`${color}● §f${title}:`}</text>
				<text margin={{ top: 2, bottom: 2, left: 2, right: 10 }}>{`${color}${value}`}</text>
			</div>
		))}
	</box>
);
