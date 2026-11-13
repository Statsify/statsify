/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { s } from "#definition/s";

export const TicketSchema = s.model("Ticket", {
  channel: s.string().index({ unique: true }),
  owner: s.string().index({ unique: true }),
  username: s.string(),
});

export type Ticket = s.infer<typeof TicketSchema>;
