/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ApiSettings } from "#types";
import type { RawMember, RawMuseum, RawProfile } from "#raw";

/**
 * Hypixel only leaves out what each setting hides. With the inventory off, `inventory` can still hold the sacks bag,
 * so inv_contents decides it. `museum` is set only when a museum response is passed.
 */
export function getApiSettings(profile: RawProfile, member: RawMember, museum?: RawMuseum): ApiSettings {
  const settings: ApiSettings = {
    skills: member.player_data?.experience !== undefined,
    inventory: member.inventory?.inv_contents !== undefined,
    personalVault: member.inventory?.personal_vault_contents !== undefined,
    collections: member.collection !== undefined,
    banking: profile.banking !== undefined,
  };

  if (!museum) return settings;

  // player_id is dashed; the museum response keys members by the undashed uuid
  const uuid = member.player_id?.replaceAll("-", "");
  return { ...settings, museum: uuid !== undefined && museum.members?.[uuid] !== undefined };
}
