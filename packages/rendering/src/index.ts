/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-namespace */
export * from "./colors/index.js";
export * from "./font/index.js";
export * from "./hooks/index.js";
export * from "./jsx/index.js";
export * from "./components/index.js";

import type * as JSXInternal from "./jsx/index.js";

declare global {
  namespace JSX {
    //@ts-ignore Typescript for the love of god won't let me override this interface
    type IntrinsicElements = JSXInternal.IntrinsicProps;

    //@ts-ignore Typescript for the love of god won't let me override this interface
    type Element = JSXInternal.ElementNode;

    type Children<T = Element> = JSXInternal.Children<T>;

    type Measurement = JSXInternal.Measurement;
  }
}
