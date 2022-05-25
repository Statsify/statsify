import { JSX } from '@statsify/rendering';
import type { Canvas, Image } from 'skia-canvas';

export interface BackgroundProps {
  background: Canvas | Image;
}

export const Background: JSX.FC<BackgroundProps> = ({ background, children }) => {
  return (
    <img image={background} width="100%" height="100%">
      {children}
    </img>
  );
};
