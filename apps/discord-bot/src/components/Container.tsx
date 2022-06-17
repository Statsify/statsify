import { Percent } from '@statsify/rendering';
import { Image } from 'skia-canvas';
import { Background } from './Background';

export interface ContainerProps {
  /**
   * @default 97
   * @description The percent size of the container. The number should be 1-100.
   */
  percent?: Percent;

  background?: Image;

  children: JSX.Children;
}

export const Container = ({ background, percent = '97%', children }: ContainerProps) => {
  const inner = (
    <div direction="column" width={percent} height={percent} align="center">
      {children}
    </div>
  );

  if (background) {
    return <Background background={background}>{inner}</Background>;
  }

  return (
    <div width="100%" height="100%">
      {inner}
    </div>
  );
};
