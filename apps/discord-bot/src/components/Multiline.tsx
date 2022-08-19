/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Text, useChildren } from "@statsify/rendering";

export const Multiline = (props: Text.TextProps) => {
  const children = useChildren(props.children);

  if (props.margin === undefined) props.margin = 1;

  const text = children
    .join(" ")
    .split("\n")
    .map((t) => <text {...props}>{t}</text>);

  return <>{text}</>;
};
