/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { forward } from "~/lib/util/forward";
import { twMerge } from "tailwind-merge";

export const Box = forward<"div">(function Box({ className, ...properties }, reference) {
	return <div ref={reference} {...properties} className={twMerge("bg-black/60 border-4 border-black/50 text-white shadow-md", className)} />;
});
