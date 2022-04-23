import { JSX } from '@statsify/jsx';

export type SidebarItem = [title: string, value: string, color: string];

export interface SidebarProps {
  items: SidebarItem[];
}

export const Sidebar: JSX.FC<SidebarProps> = ({ items }) => (
  <box direction="column">
    {items.map(([title, value, color]) => (
      <div>
        <text margin={4}>{`${color}● §f${title}:`}</text>
        <text margin={4}>{`${color}${value}`}</text>
      </div>
    ))}
  </box>
);
