/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { procedure, router } from "#routing";

export const usersRouter = router({
  get: procedure.query(() => ({ players: [] })),
  update: procedure.mutation(() => ({ players: [] })),
  verify: procedure.mutation(() => ({ players: [] })),
  unverify: procedure.mutation(() => ({ players: [] })),
});