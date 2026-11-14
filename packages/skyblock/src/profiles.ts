/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { add } from "@statsify/math";
import { minecraftColors } from "@statsify/util";
import {
  BANK_TIERS,
  type BankTier,
  type Freshness,
  type GameMode,
  PLAYER_CLAIMS,
  type PlayerExtras,
  type PlayerRef,
  type ProfileSummary,
  type Skill,
  type SkyBlockProfilesView,
  type StoredPlayerSkyBlock,
} from "#types";
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

const isPending = (member: RawMember) => member.profile?.coop_invitation?.confirmed === false;

/** Everyone who accepted their invite, ex-members included, as co-op sums count them (unverified). */
export const coopMembers = (profile: RawProfile) => Object.entries(profile.members).filter(([, member]) => !isPending(member));

/** Leaving a profile leaves the member behind with a deletion_notice. */
export function isMember(profile: RawProfile, uuid: string) {
  const member = profile.members[uuid];
  if (!member) return false;
  return member.profile?.deletion_notice === undefined && !isPending(member);
}

/** NEU's level brackets, one every 40 levels from gray to dark red; level 0 takes the first. */
function levelColor(level: number) {
  const brackets = Object.entries(LEVELING.sblevel_colours);
  const [, id] = brackets.findLast(([from]) => level >= Number(from)) ?? brackets[0];
  return minecraftColors.find((color) => color.id === id)!.code;
}

// Each bank tier's balance limit and the balance its interest stops at, and the interest brackets as [up to, rate]
// (the wiki's Bank page, an owner exception, unverified). A co-op member's personal bank gets a fifth of each, brackets too.
const BANK: Record<BankTier, { limit: number; interestUpTo: number }> = {
  STARTER: { limit: 50e6, interestUpTo: 15e6 },
  GOLD: { limit: 100e6, interestUpTo: 20e6 },
  DELUXE: { limit: 250e6, interestUpTo: 30e6 },
  SUPER_DELUXE: { limit: 500e6, interestUpTo: 50e6 },
  PREMIER: { limit: 1e9, interestUpTo: 160e6 },
  LUXURIOUS: { limit: 6e9, interestUpTo: 5.16e9 },
  PALATIAL: { limit: 60e9, interestUpTo: 55.16e9 },
};

const INTEREST_BRACKETS = [
  [10e6, 0.02],
  [20e6, 0.01],
  [30e6, 0.005],
  [50e6, 0.002],
  [160e6, 0.001],
  [5.16e9, 0.0001],
  [55.16e9, 0.000_01],
] as const;

/** A season's interest: each bracket's rate on the part of the balance inside it, up to `upTo`. */
const bankInterest = (balance: number, upTo: number) =>
  add(
    ...INTEREST_BRACKETS.map(([upper, rate], index) => {
      const lower = index === 0 ? 0 : INTEREST_BRACKETS[index - 1][0];
      return Math.max(0, Math.min(balance, upTo, upper) - lower) * rate;
    })
  );

const personalBankInterest = (balance: number, upTo: number) => bankInterest(balance * 5, upTo) / 5;

// The members' tasks can disagree, so the highest any member has counts
const bankTier = (profile: RawProfile): BankTier => {
  const tasks = new Set(Object.values(profile.members).flatMap((member) => member.leveling?.completed_tasks ?? []));
  return BANK_TIERS.findLast((tier) => tasks.has(`BANK_UPGRADE_${tier}`)) ?? "STARTER";
};

export function toProfileSummary(profile: RawProfile, uuid: string): ProfileSummary {
  const member = profile.members[uuid];
  const xp = member.leveling?.experience ?? 0;
  const level = Math.floor(xp / SKYBLOCK_XP_PER_LEVEL);
  const gameMode = gameModeOf(profile);
  const tier = bankTier(profile);
  const balance = profile.banking?.balance;
  const personal = member.profile?.bank_account;
  const { limit, interestUpTo } = BANK[tier];

  return {
    id: profile.profile_id,
    cuteName: profile.cute_name,
    gameMode,
    selected: profile.selected ?? false,
    members: Object.entries(profile.members).map(([id, other]) => ({
      uuid: id,
      removed: other.profile?.deletion_notice !== undefined,
      invited: isPending(other),
      firstJoin: other.profile?.first_join,
    })),
    level,
    levelColor: levelColor(level),
    xp,
    newProfile: isNew(member),
    purse: member.currencies?.coin_purse ?? 0,
    bank: balance,
    bankTier: tier,
    bankLimit: limit,
    // Only with the co-op's balance, so the personal bank's part never stands in for the whole
    bankInterest:
      balance === undefined ? undefined : add(bankInterest(balance, interestUpTo), personalBankInterest(personal ?? 0, interestUpTo)),
    personalBank: personal,
    personalBankLimit: personal === undefined ? undefined : limit / 5,
    firstJoin: member.profile?.first_join,
    fairySouls: member.fairy_soul?.total_collected ?? 0,
    // Stranded and Bingo play on islands that hold fewer souls, and no data source says how many
    maxFairySouls: ["normal", "ironman"].includes(gameMode) ? LEVELING.fairy_souls : undefined,
  };
}

export function toProfilesView(player: PlayerRef, profiles: RawProfile[], freshness: Freshness): SkyBlockProfilesView {
  return {
    ...player,
    ...freshness,
    profiles: profiles.filter((profile) => isMember(profile, player.uuid)).map((profile) => toProfileSummary(profile, player.uuid)),
  };
}

// Read from the achievement names and unchecked in game. Carpentry, runecrafting and social have none.
const SKILL_ACHIEVEMENTS = {
  farming: "harvester",
  mining: "excavator",
  combat: "combat",
  foraging: "gatherer",
  fishing: "angler",
  enchanting: "augmentation",
  alchemy: "concoctor",
  taming: "domesticator",
  hunting: "predator",
} as const satisfies Partial<Record<Skill, keyof StoredPlayerSkyBlock>>;

export function toPlayerExtras(stored: StoredPlayerSkyBlock): PlayerExtras {
  return {
    highestSkills: Object.fromEntries(
      Object.entries(SKILL_ACHIEVEMENTS).flatMap(([skill, key]) => (stored[key] ? [[skill, stored[key]]] : []))
    ),
    commissions: stored.hardWorkingMiner ?? 0,
    claimed: Object.fromEntries(PLAYER_CLAIMS.flatMap((claim) => (stored[claim] ? [[claim, stored[claim]]] : []))),
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

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("bankInterest pays each bracket's rate up to the tier's cap, a fifth as wide in a personal bank", () => {
    expect(bankInterest(5e6, 15e6)).toBeCloseTo(100_000);
    expect(bankInterest(40e6, 15e6)).toBeCloseTo(250_000);
    expect(bankInterest(25e6, 30e6)).toBeCloseTo(325_000);
    expect(bankInterest(60e9, 55.16e9)).toBeCloseTo(1_500_000);
    expect(personalBankInterest(2e6, 15e6)).toBeCloseTo(40_000);
  });
}
