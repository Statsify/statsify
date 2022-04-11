import { FontRenderer, JSX } from '@statsify/jsx';

export type SidebarItem = [title: string, value: string, color: string];

export interface SidebarProps {
  items: SidebarItem[];
  renderer: FontRenderer;
}

export const Sidebar: JSX.FC<SidebarProps> = ({ items, renderer }) => (
  <box direction="column">
    {items.map(([title, value, color]) => (
      <div>
        <text renderer={renderer} margin={4}>{`${color}● §f${title}:`}</text>
        <text renderer={renderer} margin={4}>{`${color}${value}`}</text>
      </div>
    ))}
  </box>
);
