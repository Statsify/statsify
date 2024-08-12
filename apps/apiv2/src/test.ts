/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { app } from "#mod";
import { createContext, t } from "#trpc";

const caller = t.createCallerFactory(app)(await createContext());

const result = await caller.guilds.getWithMemberNames({ tag: "manhal_iq_", type: "member" });