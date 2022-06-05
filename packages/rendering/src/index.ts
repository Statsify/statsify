/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-namespace */
export * from './colors';
export * from './font';
export * from './hooks';
export * from './jsx';

import type * as JSXInternal from './jsx';

declare global {
  namespace JSX {
    //@ts-ignore Typescript for the love of god won't let me override this interface
    type IntrinsicElements = JSXInternal.IntrinsicProps;

    type FC<T = {}> = JSXInternal.FC<T>;

    //@ts-ignore Typescript for the love of god won't let me override this interface
    type Element = JSXInternal.ElementNode;

    type Children<T = Element> = JSXInternal.Children<T>;

    type Measurement = JSXInternal.Measurement;
  }
}
