/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { AccountPage } from "@statsify/contract";

/**
 * Who's logged in, for the header: the primary profile's UUID, `-` with none linked, absent when logged out. Pages are
 * cached for everyone, so only the browser reads it; the server never does, and the session stays in its HttpOnly
 * cookie. `/account` rewrites it on every visit, so a hint that outlived its session clears on the next one.
 */
const COOKIE = "statsify_account";
export const NO_PROFILE = "-";
const CHANGED = "statsify-account";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** The cookie's value, `""` when logged out. A string, so `useSyncExternalStore` sees the same snapshot until it changes. */
export function readAccountHint(): string {
  return /(?:^|; )statsify_account=([\da-f]{32}|-)(?:;|$)/.exec(document.cookie)?.[1] ?? "";
}

export function onAccountHintChange(listener: () => void) {
  window.addEventListener(CHANGED, listener);
  return () => window.removeEventListener(CHANGED, listener);
}

export function rememberAccount(account: AccountPage | null) {
  const profile = account && (account.profiles.find(({ primary }) => primary) ?? account.profiles[0]);
  const value = account ? profile?.uuid ?? NO_PROFILE : "";
  const secure = location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${value ? MAX_AGE_SECONDS : 0}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGED));
}
