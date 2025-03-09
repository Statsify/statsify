/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Text, useChildren, useComponentWidth } from "@statsify/rendering";

// do not use
export const WordWrap = (props: Text.TextProps & { maxWidth: number }) => {
  const children = useChildren(props.children);
  const words = children.filter((child) => child !== undefined).join("").split(" ");

  const rows = [];
  let currentWidth = 0;
  let currentText = "";

  for (const word of words) {
    const spacedWord = currentText === "" ? word : ` ${word}`;
    const wordWidth = useComponentWidth(<text size={props.size} margin={0}>{spacedWord}</text>);

    if (currentWidth + wordWidth > props.maxWidth) {
      rows.push(currentText);
      currentWidth = wordWidth;
      currentText = word;
    } else {
      currentText += spacedWord;
      currentWidth += wordWidth;
    }
  }

  if (currentText !== "") rows.push(currentText);

  return (
    <div width={rows.length > 1 ? props.maxWidth : undefined} direction="column" margin={props.margin ?? 6}>
      {rows.map((row) => (
        <text
          align={props.align}
          margin={{ left: 0, right: 0, top: 1, bottom: 1 }}
          color={props.color}
        >§7{row}
        </text>
      ))}
    </div>
  );
};
