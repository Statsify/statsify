import { FontRenderer, JSX, useComponentHeight, useComponentWidth } from '@statsify/jsx';
import { Image } from 'canvas';
import { Sidebar, SidebarItem } from './Sidebar';
import { Skin } from './Skin';

export interface HeaderProps {
  renderer: FontRenderer;
  skin: Image;
  sidebar: SidebarItem[];
  width: number;
  gameTitle: string;
  playerName: string;
  playerDescription: string;
}

export const Header: JSX.FC<HeaderProps> = ({
  renderer,
  skin: skinImage,
  sidebar: sidebarItems,
  width,
  gameTitle,
  playerName,
  playerDescription,
}) => {
  const sidebar = <Sidebar renderer={renderer} items={sidebarItems} />;

  const headerHeight = useComponentHeight(sidebar) - 8;

  const skin = <Skin skin={skinImage} height={headerHeight} />;

  const remainingHeaderWidth = width - useComponentWidth(sidebar) - useComponentWidth(skin);

  const nameTag = (
    <box width="100%">
      <text renderer={renderer}>§^4^{playerName}</text>
    </box>
  );

  const gameTag = (
    <box width="100%">
      <text renderer={renderer}>{gameTitle}</text>
    </box>
  );

  const remainingHeaderHeight =
    headerHeight - useComponentHeight(nameTag) - useComponentHeight(gameTag);

  return (
    <div>
      {skin}
      <div direction="column" width={remainingHeaderWidth}>
        <div direction="column">
          {nameTag}
          <box direction="column" width="100%" height={remainingHeaderHeight}>
            {playerDescription.split('\n').map((line) => (
              <text renderer={renderer}>{line}</text>
            ))}
          </box>
        </div>
        {gameTag}
      </div>
      {sidebar}
    </div>
  );
};
