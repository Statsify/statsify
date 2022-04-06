import type { BoxProps, DivProps, ImageProps, TextProps } from './components';
import type { ElementNode, FC as FCInternal, PropsWithChildren } from './jsx';

/* eslint-disable @typescript-eslint/no-namespace */
export * from './components';
export * from './hooks';
export * as JSX from './jsx';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: PropsWithChildren<DivProps>;
      box: PropsWithChildren<BoxProps>;
      text: PropsWithChildren<TextProps, string>;
      img: PropsWithChildren<ImageProps>;
    }

    type FC = FCInternal;

    //@ts-ignore Typescript for the love of god won't let me override this interface
    type Element = ElementNode;
  }
}
