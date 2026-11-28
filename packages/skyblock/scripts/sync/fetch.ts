/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const SYNC_TIMEOUT_MS = 60_000;

export async function fetchOk(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response;
}
