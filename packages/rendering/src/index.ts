/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-namespace */
export * from "./colors";
export * from "./font";
export * from "./hooks";
export * from "./jsx";
export * from "./components";

import type * as JSXInternal from "./jsx";

declare global {
  namespace JSX {
    //@ts-ignore Typescript for the love of god won't let me override this interface
    type IntrinsicElements = JSXInternal.IntrinsicProps;

    //@ts-ignore Typescript for the love of god won't let me override this interface
    type Element = JSXInternal.ElementNode;

    type Children<T = Element> = JSXInternal.Children<T>;

    type Measurement = JSXInternal.Measurement;

    interface ElementChildrenAttribute {
      children: {};
    }
  }
}
