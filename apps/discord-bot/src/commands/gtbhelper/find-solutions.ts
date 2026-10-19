/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import words from "../../../words.json" with { type: "json" };

export const findSolutions = (hint: string, limit?: number) => {
  hint = hint.toLowerCase().replaceAll("_", "?");

  const solutions: string[] = [];

  for (let word of words) {
    // Check if the word and hint have the same length and the same amount of words
    if (word.length !== hint.length || hint.split(" ").length !== word.split(" ").length)
      continue;

    word = word.toLowerCase();

    for (let i = 0; i < hint.length; i++) {
      const hintChar = hint[i];
      const wordChar = word[i];

      if (hintChar === "?") {
        if (wordChar === " ") break;
      } else if (wordChar !== hintChar) break;

      if (i === hint.length - 1) solutions.push(word);
    }

    if (limit && solutions.length >= limit) break;
  }

  return solutions;
};

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("findSolutions", () => {
    it("should not have duplicate words", () => {
      const seen = new Set<string>();

      const duplicates = words.filter((word) => {
        const key = word.toLowerCase();
        if (seen.has(key)) return true;
        seen.add(key);
        return false;
      });

      expect(duplicates).toEqual([]);
    });

    it("should return each matching word once", () => {
      expect(findSolutions("centaur")).toEqual(["centaur"]);
      expect(findSolutions("grappling hook")).toEqual(["grappling hook"]);
      expect(findSolutions("picture frame")).toEqual(["picture frame"]);
    });
  });
}
