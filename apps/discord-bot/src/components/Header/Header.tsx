import { JSX, useChildren } from '@statsify/rendering';
import { Image } from 'skia-canvas';
import { Sidebar, SidebarItem } from '../Sidebar';
import { HeaderNametag } from './HeaderNametag';
import { SidebarHeader } from './SidebarHeader';
import { SidebarlessHeader } from './SidebarlessHeader';

interface SidebarHeaderProps {
  skin: Image;
  name: string;
  children: JSX.Children<(height?: number) => JSX.ElementNode>;
  sidebar: SidebarItem[];
  width: number;
}

interface SidebarlessHeaderProps {
  skin: Image;
  name: string;
  children: JSX.Children;
  width: number;
}

export type HeaderProps = SidebarHeaderProps | SidebarlessHeaderProps;

/**
 *
 * @example With sidebar
 * ```ts
 * const skin = new Image();
 * const player = { prefixName: "j4cobi" };
 * const width = 100;
 * const sidebar: SidebarItem = [
 *  ['Item', '10', '§a'],
 *  ['Item', '10', '§a'],
 *  ['Item', '10', '§a'],
 * ];
 *
 * <Header skin={skin} name={player.prefixName} width={width} sidebar={sidebar}>
 *  {(height) => <HeaderBody title="Title" description="Description" height={height} />}
 * </Header>
 * ```
 * @example Sidebarless
 * ```ts
 * const skin = new Image();
 * const player = { prefixName: "j4cobi" };
 * const width = 100;
 *
 * <Header skin={skin} name={player.prefixName} width={width}>
 *  <HeaderBody title="Title" description="Description"/>
 * </Header>
 * ```
 */
export const Header: JSX.FC<HeaderProps> = (props) => {
  const nameTag = <HeaderNametag name={props.name} />;

  if ('sidebar' in props) {
    const sidebar = <Sidebar items={props.sidebar} />;
    const [headerBody] = useChildren(props.children);

    return (
      <SidebarHeader
        width={props.width}
        sidebar={sidebar}
        skin={props.skin}
        bodyEl={headerBody}
        name={nameTag}
      />
    );
  }

  const [headerBody] = useChildren(props.children);

  return (
    <SidebarlessHeader width={props.width} skin={props.skin} body={headerBody} name={nameTag} />
  );
};
