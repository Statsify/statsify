import { JSX, useChildren } from '@statsify/rendering';
import { Image } from 'skia-canvas';
import { Background } from './Background';

interface BaseContainerProps {
  /**
   * @default 95
   * @description The percent size of the container. The number should be 1-100.
   */
  percent?: number;

  background: Image;
}

interface DefinedSizeContainerProps extends BaseContainerProps {
  width: number;
  height: number;
  children: JSX.Children | JSX.Children<(width: number, height: number) => JSX.Children>;
}

interface UndefinedSizeContainerProps extends BaseContainerProps {
  children: JSX.Children;
}

export type ContainerProps = DefinedSizeContainerProps | UndefinedSizeContainerProps;

/**
 *
 * @description Restricts the children to a percentage of the container
 * @example
 * ```ts
 * <Container background={background} width={100} height={100} percent={50}>
 *  <box width={100} height={100} />
 * </Container>
 * ```
 * @example
 * ```ts
 * <Container background={background} width={100} height={100}>
 *  <box width={100} height={100} />
 * </Container>
 * ```
 * @example
 * ```ts
 * <Container background={background}>
 *  <box width={100} height={100} />
 * </Container>
 * ```
 * @example
 * ```ts
 * <Container background={background} percent={50}>
 *  <box width={100} height={100} />
 * </Container>
 * ```
 * @example
 * ```ts
 * <Container background={background} width={100} height={100} percent={50}>
 *  {(width, height) => <box width={width} height={height} />}
 * </Container>
 * ```
 * @example
 * ```ts
 * <Container background={background} width={100} height={100}>
 *  {(width, height) => <box width={width} height={height} />}
 * </Container>
 * ```
 */
export const Container: JSX.FC<ContainerProps> = (props) => {
  const percent = props.percent ?? 95;
  const containerWidth =
    'width' in props ? (props.width * percent) / 100 : (`${percent}%` as const);
  const containerHeight =
    'height' in props ? (props.height * percent) / 100 : (`${percent}%` as const);

  const children = useChildren(props.children);

  let inner: JSX.Children;

  if (typeof children[0] === 'function') {
    inner = children[0](containerWidth as number, containerHeight as number);
  } else {
    inner = children as JSX.ElementNode[];
  }

  return (
    <Background background={props.background}>
      <div direction="column" width={containerWidth} height={containerHeight} align="center">
        {inner}
      </div>
    </Background>
  );
};
