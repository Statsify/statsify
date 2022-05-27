import { JSX } from '@statsify/rendering';
import type { Image } from 'skia-canvas';
import { If } from '../If';

export interface HeaderNametagProps {
  name: string;
  badge?: Image;
}

export const HeaderNametag: JSX.FC<HeaderNametagProps> = ({ name, badge }) => {
  return (
    <box width="100%">
      <If condition={Boolean(badge)}>{() => <img image={badge as Image} />}</If>
      <text>§^4^{name}</text>
    </box>
  );
};
