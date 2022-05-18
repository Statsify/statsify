import { JSX, useChildren } from '@statsify/jsx';

export interface ContainerProps {
  width: number;
  height: number;

  /**
   * 1-100
   */
  percent: number;

  children: JSX.Children | JSX.Children<(width: number, height: number) => JSX.Children>;
}

export const Container: JSX.FC<ContainerProps> = ({
  width,
  height,
  percent,
  children: _children,
}) => {
  const containerWidth = (width * percent) / 100;
  const containerHeight = (height * percent) / 100;

  const children = useChildren(_children);

  let inner: JSX.Children;

  if (typeof children[0] === 'function') {
    inner = children[0](containerWidth, containerHeight);
  } else {
    inner = children as JSX.ElementNode[];
  }

  return (
    <div width="100%" height="100%">
      <div direction="column" width={containerWidth} height={containerHeight} align="center">
        {inner}
      </div>
    </div>
  );
};
