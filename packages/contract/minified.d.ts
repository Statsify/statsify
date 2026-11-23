/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { AnyContractRouter } from "@orpc/contract";

/** The type of `dist/contract.min.json`, so the site typechecks before the package is built. */
declare const minified: AnyContractRouter;
export default minified;
