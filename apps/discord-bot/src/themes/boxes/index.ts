/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as HDBox from "./hd.box.js";
import * as UHDBox from "./uhd.box.js";
import { Box, Render } from "@statsify/rendering";
import { UserBoxes } from "@statsify/schemas";

export function getBoxRenderer(boxes: UserBoxes): Render<Box.BoxRenderProps> {
	switch (boxes) {
		case UserBoxes.DEFAULT:
			return Box.render;

		case UserBoxes.HD:
			return HDBox.render;

		case UserBoxes.UHD:
			return UHDBox.render;
	}
}
