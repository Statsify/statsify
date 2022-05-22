import { JSX } from '@statsify/rendering';

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
export const Sidebar: JSX.FC<SidebarProps> = ({ items }) => (
  <box direction="column">
    {items.map(([title, value, color]) => (
      <div>
        <text margin={{ top: 2, bottom: 2, left: 10, right: 2 }}>{`${color}● §f${title}:`}</text>
        <text margin={{ top: 2, bottom: 2, left: 2, right: 10 }}>{`${color}${value}`}</text>
      </div>
    ))}
  </box>
);
