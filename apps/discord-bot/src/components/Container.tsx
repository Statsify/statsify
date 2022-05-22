import { JSX, useChildren } from '@statsify/rendering';

export interface ContainerProps {
  width: number;
  height: number;

  /**
   * 1-100
   */
  percent?: number;

  children: JSX.Children | JSX.Children<(width: number, height: number) => JSX.Children>;
}

/**
 *
 * @description Restricts the children to a percentage of the container
 * @example
 * ```ts
 * <Container width={100} height={100} percent={50}>
 *  <box width={100} height={100} />
 * </Container>
 * ```
 * @example
 * ```ts
 * <Container width={100} height={100}>
 *  <box width={100} height={100} />
 * </Container>
 * ```
 * @example
 * ```ts
 * <Container width={100} height={100} percent={50}>
 *  {(width, height) => <box width={width} height={height} />}
 * </Container>
 * ```
 * @example
 * ```ts
 * <Container width={100} height={100}>
 *  {(width, height) => <box width={width} height={height} />}
 * </Container>
 * ```
 */
export const Container: JSX.FC<ContainerProps> = ({
  width,
  height,
  percent = 90,
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
