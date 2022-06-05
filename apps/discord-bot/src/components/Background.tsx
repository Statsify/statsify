import type { Canvas, Image } from 'skia-canvas';

export interface BackgroundProps {
  background: Canvas | Image;
  children: JSX.Children;
}

export const Background = ({ background, children }: BackgroundProps) => {
  return (
    <img image={background} width="100%" height="100%">
      {children}
    </img>
  );
};
