/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Theme } from "@statsify/rendering";
import { UserTheme } from "@statsify/schemas";
import { hdTheme } from "./hd";

export const getTheme = (
  theme: UserTheme = UserTheme.DEFAULT
): Theme<any> | undefined => {
  switch (theme) {
    case UserTheme.HD:
      return hdTheme;
    case UserTheme.DEFAULT:
    default:
      return undefined;
  }
};
