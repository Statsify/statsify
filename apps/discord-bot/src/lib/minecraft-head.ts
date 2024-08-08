/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { randomUUID } from "node:crypto";

export function minecraftHeadUrl(uuid: string) {
  const dashlessUuid = uuid.replaceAll("-", "");
  return `https://crafatar.com/avatars/${dashlessUuid}?size=160&default=MHF_Steve&overlay&id=${randomUUID()}`;
}
