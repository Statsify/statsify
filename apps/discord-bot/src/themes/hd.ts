/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container from "typedi";
import { BaseThemeContext, IntrinsicRenders, Theme } from "@statsify/rendering";

const context: BaseThemeContext = {
  renderer: Container.get("HDFontRenderer"),
};

const elements: Partial<IntrinsicRenders<BaseThemeContext>> = {};

export const hdTheme: Theme<BaseThemeContext> = {
  context,
  elements,
};
