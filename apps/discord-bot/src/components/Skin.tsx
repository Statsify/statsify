import { JSX } from '@statsify/jsx';
import { Image } from 'canvas';

export interface SkinProps {
  skin: Image;
  height?: number;
}

export const Skin: JSX.FC<SkinProps> = ({ skin, height }) => (
  <box width={150} height={height}>
    <img image={skin} />
  </box>
);
