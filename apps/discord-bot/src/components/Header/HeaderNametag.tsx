import type { Image } from 'skia-canvas';
import { If } from '../If';

export interface HeaderNametagProps {
  name: string;
  badge?: Image;
  size?: number;
}

export const HeaderNametag = ({ name, badge, size = 4 }: HeaderNametagProps) => {
  return (
    <box width="100%">
      <If condition={badge}>{(badge) => <img image={badge} />}</If>
      <text>
        §^{size}^{name}
      </text>
    </box>
  );
};
