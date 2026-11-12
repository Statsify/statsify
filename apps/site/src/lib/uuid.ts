/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** A Minecraft UUID in a URL: 32 hex digits, with or without the four dashes, in any case. */
export const UUID_PATTERN = /^[\da-f]{32}$|^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

/** The account whose skin stands in for players we have nothing to show yet. */
export const PLACEHOLDER_UUID = "76a56ac7fcf649fca0531cb5c77cd9ae";

/**
 * The UUID the way the API stores it, undashed and lower case, or `null` for anything that isn't one.
 * The image routes read every spelling through this, so they serve one image under one cache key.
 */
export function compactUuid(value: string): string | null {
  return UUID_PATTERN.test(value) ? value.replaceAll("-", "").toLowerCase() : null;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("compactUuid", () => {
    it("reads a UUID with or without dashes, in any case, as the same value, and rejects anything else", () => {
      const compact = "4a6e5f3c2b1d4e0f9a8b7c6d5e4f3a2b";
      expect(compactUuid(compact)).toBe(compact);
      expect(compactUuid("4A6E5F3C-2b1d-4E0F-9a8b-7C6D5E4F3A2B")).toBe(compact);
      expect(compactUuid("anrie")).toBeNull();
      expect(compactUuid("4a6e5f3c-2b1d4e0f-9a8b-7c6d5e4f3a2b")).toBeNull();
    });
  });
}
