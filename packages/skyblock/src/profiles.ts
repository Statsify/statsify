/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { minecraftColors } from "@statsify/util";
import type { Freshness, GameMode, PlayerRef, ProfileSummary, SkyBlockProfilesView } from "#types";
import type { RawMember, RawProfile } from "#raw";

export const SKYBLOCK_XP_PER_LEVEL = 100;

const GAME_MODES: Record<string, GameMode> = { normal: "normal", ironman: "ironman", island: "stranded", bingo: "bingo" };

export const gameModeOf = ({ game_mode }: RawProfile): GameMode => GAME_MODES[game_mode ?? "normal"] ?? "normal";

/**
 * Brand new: SkyBlock levels exist with 0 XP and there's no skill XP. Profiles older than SkyBlock levels have no
 * `leveling`, and an inventory holding only the sacks bag is the inventory API being off, never a new profile.
 */
function isNew(member: RawMember) {
  const skillXp = Object.entries(member.player_data?.experience ?? {}).some(([key, xp]) => /^SKILL_[A-Z]+$/.test(key) && xp > 0);
  const inventoryOff = member.inventory !== undefined && member.inventory.inv_contents === undefined;
  return member.leveling !== undefined && !member.leveling.experience && !skillXp && !inventoryOff;
}

/** Leaving a profile leaves the member behind with a deletion_notice; a pending invite lists them unconfirmed. */
export function isMember(profile: RawProfile, uuid: string) {
  const member = profile.members[uuid];
  if (!member) return false;
  return member.profile?.deletion_notice === undefined && member.profile?.coop_invitation?.confirmed !== false;
}

/** NEU's level brackets, one every 40 levels from gray to dark red; level 0 takes the first. */
function levelColor(level: number) {
  const brackets = Object.entries(LEVELING.sblevel_colours);
  const [, id] = brackets.findLast(([from]) => level >= Number(from)) ?? brackets[0];
  return minecraftColors.find((color) => color.id === id)!.code;
}

export function toProfileSummary(profile: RawProfile, uuid: string): ProfileSummary {
  const member = profile.members[uuid];
  const xp = member.leveling?.experience ?? 0;
  const level = Math.floor(xp / SKYBLOCK_XP_PER_LEVEL);

  return {
    id: profile.profile_id,
    cuteName: profile.cute_name,
    gameMode: gameModeOf(profile),
    selected: profile.selected ?? false,
    members: Object.entries(profile.members).map(([id, other]) => ({
      uuid: id,
      removed: other.profile?.deletion_notice !== undefined,
    })),
    level,
    levelColor: levelColor(level),
    xp,
    newProfile: isNew(member),
    purse: member.currencies?.coin_purse ?? 0,
    bank: profile.banking?.balance,
    personalBank: member.profile?.bank_account,
    firstJoin: member.profile?.first_join,
    fairySouls: member.fairy_soul?.total_collected ?? 0,
  };
}

export function toProfilesView(player: PlayerRef, profiles: RawProfile[], freshness: Freshness): SkyBlockProfilesView {
  return {
    ...player,
    ...freshness,
    profiles: profiles.filter((profile) => isMember(profile, player.uuid)).map((profile) => toProfileSummary(profile, player.uuid)),
  };
}

/**
 * A profile by id or cute name (any case). Without one, the selected profile, or the one with the most SkyBlock XP when
 * none is selected. Only profiles the player is still in.
 */
export function findProfile(profiles: RawProfile[], uuid: string, profile?: string): RawProfile | undefined {
  const own = profiles.filter((candidate) => isMember(candidate, uuid));
  const xp = ({ members }: RawProfile) => members[uuid].leveling?.experience ?? 0;
  if (profile === undefined) return own.find(({ selected }) => selected) ?? own.toSorted((a, b) => xp(b) - xp(a))[0];

  const name = profile.toLowerCase();
  return own.find(({ profile_id, cute_name }) => profile_id.toLowerCase() === name || cute_name.toLowerCase() === name);
}
