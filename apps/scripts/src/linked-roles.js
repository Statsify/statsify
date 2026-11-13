/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ROLE_CONNECTION_METADATA } from "@statsify/schemas";
import { config } from "@statsify/util";

const applicationId = await config("discordBot.applicationId");
const token = await config("discordBot.token");

// Replaces every record, so a removed one disappears from servers' role requirements
const response = await fetch(
  `https://discord.com/api/v10/applications/${applicationId}/role-connections/metadata`,
  {
    method: "PUT",
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      ROLE_CONNECTION_METADATA.map(({ key, name, description, type }) => ({
        key,
        name,
        description,
        type,
      }))
    ),
  }
);

if (!response.ok) {
  console.error(`Registering failed with ${response.status}:`, await response.text());
  process.exit(1);
}

console.log("Registered:", await response.json());
