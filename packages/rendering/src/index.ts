import type { ElementNode, FC as FCInternal, IntrinsicProps } from './jsx';

/* eslint-disable @typescript-eslint/no-namespace */
export * from './colors';
export * from './components';
export * from './font';
export * from './hooks';
export * as JSX from './jsx';

declare global {
  namespace JSX {
    //@ts-ignore Typescript for the love of god won't let me override this interface
    type IntrinsicElements = IntrinsicProps;

    type FC = FCInternal;

    //@ts-ignore Typescript for the love of god won't let me override this interface
    type Element = ElementNode;
  }
}
