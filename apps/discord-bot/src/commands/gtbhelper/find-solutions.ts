/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import words from "../../../words.json" with { type: "json" };

export const findSolutions = (hint: string, limit?: number) => {
  const pattern = hint.toLowerCase().replaceAll("_", "?");

  const solutions: string[] = [];

  for (let word of words) {
    // Check if the word and hint have the same length and the same amount of words
    if (word.length !== pattern.length || pattern.split(" ").length !== word.split(" ").length)
      continue;

    word = word.toLowerCase();

    for (let i = 0; i < pattern.length; i++) {
      const hintChar = pattern[i];
      const wordChar = word[i];

      if (hintChar === "?") {
        if (wordChar === " ") break;
      } else if (wordChar !== hintChar) break;

      if (i === pattern.length - 1) solutions.push(word);
    }

    if (limit && solutions.length >= limit) break;
  }

  return solutions;
};
