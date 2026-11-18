/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ROLE_CONNECTION_METADATA } from "@statsify/schemas";
import { RestClient } from "tiny-discord";
import { config } from "@statsify/util";

const applicationId = await config("discordBot.applicationId");
const token = await config("discordBot.token");

const client = new RestClient({ token });

// Replaces every record, so a removed one disappears from servers' role requirements
const response = await client.put(
  `/applications/${applicationId}/role-connections/metadata`,
  ROLE_CONNECTION_METADATA.map(({ key, name, description, type }) => ({
    key,
    name,
    description,
    type,
  }))
);

if (response.status !== 200) {
  console.error(`Registering failed with ${response.status}:`, response.body.text);
  process.exit(1);
}

console.log("Registered:", response.body.json);
