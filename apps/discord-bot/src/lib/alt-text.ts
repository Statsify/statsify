/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Footer, Header, HeaderBody, List, Sidebar } from "#components";
import { render } from "@statsify/rendering";
import type { IMessage, InteractionAttachment } from "@statsify/discord";
import type { TextNode, Theme } from "@statsify/rendering";

const MAX_LENGTH = 1024;
const PROGRESS_BAR = /\[[|■]+\]/;

const getText = (node: JSX.Element): string[] => {
  if (node.type === "text") {
    const text = (node.props.text as TextNode[]).map(({ text }) => text).join("").trim();
    return PROGRESS_BAR.test(text) ? [] : [text];
  }

  return node.children?.flatMap(getText) ?? [];
};

const join = (texts: string[]) => texts.filter(Boolean).join(" ");

// Call before render(), which copies each component's name onto its unnamed children
const getAltText = (card: JSX.Element): string => {
  const header: string[] = [];
  const cells: string[] = [];

  const walk = (node: JSX.Element, inHeader = false) => {
    const isHeader = inHeader || node.component === Header.name;

    if (node.component === Sidebar.name || node.component === Footer.name) return;

    if (node.component === HeaderBody.name) {
      header.push(getText(node).at(-1)!);
    } else if (node.component === List.name) {
      // List lays its items out column by column, so read each row across the columns
      const columns = node.children!.map((column) =>
        column.children!.map((cell) => join(getText(cell)))
      );
      cells.push(...columns[0].map((_, row) => join(columns.map((column) => column[row]))));
    } else if (isHeader && node.type === "text") {
      header.push(...getText(node));
    } else if (!isHeader && node.children?.some((child) => child.type === "text")) {
      cells.push(join(getText(node)));
    } else {
      for (const child of node.children ?? []) walk(child, isHeader);
    }
  };

  walk(card);

  let altText = header.filter(Boolean).join(", ");

  for (const [index, cell] of cells.filter(Boolean).entries()) {
    const separator = index === 0 ? (altText ? ": " : "") : ", ";
    const next = `${altText}${separator}${cell}`;
    if (next.length > MAX_LENGTH) break;
    altText = next;
  }

  return altText;
};

export const renderAttachment = async (
  card: JSX.Element,
  name: string,
  theme?: Theme
): Promise<InteractionAttachment> => {
  const description = getAltText(card);
  const canvas = render(card, theme);

  return { name, data: await canvas.toBuffer("png"), type: "image/png", description };
};

export const renderWithAltText = async (card: JSX.Element, theme?: Theme): Promise<IMessage> => ({
  files: [await renderAttachment(card, "image.png", theme)],
  attachments: [],
});
