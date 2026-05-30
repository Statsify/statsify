/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { describe, expect, it } from "vitest";
import { getRateLimitBucketStats } from "./auth.service.js";

describe("AuthService", () => {
  it("sums only rate limit buckets within the current window", () => {
    const now = 120_500;

    expect(
      getRateLimitBucketStats(
        {
          60: "2",
          61: "3",
          120: "5",
        },
        now
      )
    ).toEqual({
      recentRequests: 8,
      resetTime: 500,
    });
  });

  it("returns an empty rate limit state when no buckets are in the window", () => {
    expect(getRateLimitBucketStats({ 1: "2" }, 120_500)).toEqual({
      recentRequests: 0,
      resetTime: 0,
    });
  });
});
