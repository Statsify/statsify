/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { toSkyBlockLevel } from "#leveling";
import { minecraftColors } from "@statsify/util";
import type {
  Freshness,
  GameMode,
  PlayerRef,
  ProfileSummary,
  SkyBlockProfilesView,
} from "#types";
import type { RawMember, RawProfile } from "#raw";

const GAME_MODES: Record<string, GameMode> = {
  normal: "normal",
  ironman: "ironman",
  island: "stranded",
  bingo: "bingo",
};

const LEVEL_COLORS = Object.entries(LEVELING.sblevel_colours).map(
  ([from, id]) => ({
    from: Number(from),
    code: minecraftColors.find((color) => color.id === id)!.code,
  }),
);

export const getGameMode = ({ game_mode }: RawProfile): GameMode =>
  GAME_MODES[game_mode ?? "normal"] ?? "normal";

// Ironman, stranded and bingo profiles can't use the Auction House or Bazaar.
export const hasMarket = (profile: RawProfile) =>
  getGameMode(profile) === "normal";

function isNew(member: RawMember) {
  const skillXp = Object.entries(member.player_data?.experience ?? {}).some(
    ([key, xp]) => /^SKILL_[A-Z]+$/.test(key) && xp > 0,
  );
  // With the inventory API off, inventory can still hold the sacks bag.
  const inventoryOff =
    member.inventory !== undefined &&
    member.inventory.inv_contents === undefined;
  // Profiles from before SkyBlock levels have no leveling at all.
  return (
    member.leveling !== undefined &&
    !member.leveling.experience &&
    !skillXp &&
    !inventoryOff
  );
}

// A member who left keeps a deletion_notice, and an invitee is unconfirmed.
function isMember(profile: RawProfile, uuid: string) {
  const member = profile.members[uuid];
  if (!member) return false;
  return (
    member.profile?.deletion_notice === undefined &&
    member.profile?.coop_invitation?.confirmed !== false
  );
}

function getLevelColor(level: number) {
  const bracket =
    LEVEL_COLORS.findLast(({ from }) => level >= from) ?? LEVEL_COLORS[0];
  return bracket.code;
}

export function toProfileSummary(
  profile: RawProfile,
  uuid: string,
): ProfileSummary {
  const member = profile.members[uuid];
  const xp = member.leveling?.experience ?? 0;
  const { level } = toSkyBlockLevel(xp);

  return {
    id: profile.profile_id,
    cuteName: profile.cute_name,
    gameMode: getGameMode(profile),
    selected: profile.selected ?? false,
    members: Object.entries(profile.members).map(([id, other]) => ({
      uuid: id,
      removed: other.profile?.deletion_notice !== undefined,
    })),
    level,
    levelColor: getLevelColor(level),
    xp,
    newProfile: isNew(member),
    purse: member.currencies?.coin_purse ?? 0,
    bank: profile.banking?.balance,
    personalBank: member.profile?.bank_account,
    firstJoin: member.profile?.first_join,
    fairySouls: member.fairy_soul?.total_collected ?? 0,
  };
}

export function toProfilesView(
  player: PlayerRef,
  profiles: RawProfile[],
  freshness: Freshness,
): SkyBlockProfilesView {
  return {
    ...player,
    ...freshness,
    profiles: profiles
      .filter((profile) => isMember(profile, player.uuid))
      .map((profile) => toProfileSummary(profile, player.uuid)),
  };
}

export function findProfile(
  profiles: RawProfile[],
  uuid: string,
  profile?: string,
): RawProfile | undefined {
  const own = profiles.filter((candidate) => isMember(candidate, uuid));
  const xp = ({ members }: RawProfile) =>
    members[uuid].leveling?.experience ?? 0;

  if (profile === undefined) {
    const selected = own.find(({ selected }) => selected);
    return selected ?? own.toSorted((a, b) => xp(b) - xp(a))[0];
  }

  const name = profile.toLowerCase();
  return own.find(
    ({ profile_id, cute_name }) =>
      profile_id.toLowerCase() === name || cute_name.toLowerCase() === name,
  );
}
