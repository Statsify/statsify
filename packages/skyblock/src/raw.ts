/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { z } from "zod";

// The parts of Hypixel's /v2/skyblock responses this package reads, all optional since Hypixel leaves out what a player
// never touched or an API setting hides. Keys we don't read pass, and callers keep Hypixel's object, not the parsed copy.

const numbers = z.record(z.string(), z.number());

/** A base64 gzipped NBT blob. */
export const RawNbt = z.object({ type: z.number().optional(), data: z.string() });
export type RawNbt = z.infer<typeof RawNbt>;

export const RawPet = z.object({
  uuid: z.string().nullish(),
  uniqueId: z.string().nullish(),
  type: z.string(),
  exp: z.number(),
  active: z.boolean(),
  tier: z.string(),
  heldItem: z.string().nullish(),
  candyUsed: z.number().optional(),
  skin: z.string().nullish(),
});
export type RawPet = z.infer<typeof RawPet>;

export const RawDungeonType = z.object({
  experience: z.number().optional(),
  times_played: numbers.optional(),
  tier_completions: numbers.optional(),
  highest_tier_completed: z.number().optional(),
  best_score: numbers.optional(),
  fastest_time: numbers.optional(),
  fastest_time_s: numbers.optional(),
  fastest_time_s_plus: numbers.optional(),
});
export type RawDungeonType = z.infer<typeof RawDungeonType>;

export const RawSlayerBoss = z
  .object({ xp: z.number().optional() })
  .and(z.looseRecord(z.templateLiteral(["boss_kills_tier_", z.number()]), z.number().optional()));
export type RawSlayerBoss = z.infer<typeof RawSlayerBoss>;

export const RawMember = z.object({
  player_id: z.string().optional(),
  profile: z
    .object({
      deletion_notice: z.object({ timestamp: z.number() }).optional(),
      coop_invitation: z.object({ confirmed: z.boolean() }).optional(),
      bank_account: z.number().optional(),
      first_join: z.number().optional(),
    })
    .optional(),
  leveling: z.object({ experience: z.number().optional(), highest_pet_score: z.number().optional() }).optional(),
  currencies: z.object({ coin_purse: z.number().optional() }).optional(),
  player_data: z.object({ experience: numbers.optional() }).optional(),
  collection: numbers.optional(),
  inventory: z
    .object({
      inv_contents: RawNbt.optional(),
      inv_armor: RawNbt.optional(),
      equipment_contents: RawNbt.optional(),
      ender_chest_contents: RawNbt.optional(),
      personal_vault_contents: RawNbt.optional(),
      wardrobe_contents: RawNbt.optional(),
      wardrobe_equipped_slot: z.number().optional(),
      backpack_contents: z.record(z.string(), RawNbt).optional(),
      bag_contents: z
        .object({
          talisman_bag: RawNbt.optional(),
          potion_bag: RawNbt.optional(),
          fishing_bag: RawNbt.optional(),
          quiver: RawNbt.optional(),
          sacks_bag: RawNbt.optional(),
        })
        .optional(),
      sacks_counts: numbers.optional(),
    })
    .optional(),
  jacobs_contest: z.object({ perks: z.object({ farming_level_cap: z.number().optional() }).optional() }).optional(),
  pets_data: z
    .object({
      pets: z.array(RawPet).optional(),
      pet_care: z.object({ pet_types_sacrificed: z.array(z.string()).optional() }).optional(),
    })
    .optional(),
  dungeons: z
    .object({
      dungeon_types: z.object({ catacombs: RawDungeonType.optional(), master_catacombs: RawDungeonType.optional() }).optional(),
      player_classes: z.record(z.string(), z.object({ experience: z.number().optional() })).optional(),
      selected_dungeon_class: z.string().optional(),
      secrets: z.number().optional(),
    })
    .optional(),
  slayer: z.object({ slayer_bosses: z.record(z.string(), RawSlayerBoss).optional() }).optional(),
  skill_tree: z
    .object({
      nodes: z.record(z.string(), z.record(z.string(), z.union([z.number(), z.boolean()]))).optional(),
      tokens_spent: numbers.optional(),
      experience: numbers.optional(),
      selected_ability: z.record(z.string(), z.string()).optional(),
      selected_skill_tree_slot: numbers.optional(),
    })
    .optional(),
  mining_core: z
    .object({
      experience: z.number().optional(),
      nodes: z.record(z.string(), z.union([z.number(), z.boolean()])).optional(),
      tokens_spent: z.number().optional(),
      selected_pickaxe_ability: z.string().optional(),
    })
    .and(z.looseRecord(z.templateLiteral(["powder_", z.string()]), z.number().optional()))
    .optional(),
  accessory_bag_storage: z
    .object({
      tuning: z.object({ slot_0: numbers.optional() }).catchall(z.unknown()).optional(),
      selected_power: z.string().optional(),
      highest_magical_power: z.number().optional(),
    })
    .optional(),
  rift: z.object({ access: z.object({ consumed_prism: z.boolean().optional() }).optional() }).optional(),
  nether_island_player_data: z
    .object({ abiphone: z.object({ active_contacts: z.array(z.string()).optional() }).optional() })
    .optional(),
});
export type RawMember = z.infer<typeof RawMember>;

export const RawProfile = z.object({
  profile_id: z.string(),
  cute_name: z.string(),
  selected: z.boolean().optional(),
  game_mode: z.string().optional(),
  banking: z.object({ balance: z.number().optional() }).optional(),
  members: z.record(z.string(), RawMember),
});
export type RawProfile = z.infer<typeof RawProfile>;

const RawDonation = z.object({ donated_time: z.number().optional(), items: RawNbt.optional() });

export const RawMuseumMember = z.object({
  value: z.number().optional(),
  appraisal: z.boolean().optional(),
  items: z.record(z.string(), RawDonation).optional(),
  special: z.array(RawDonation).optional(),
});
export type RawMuseumMember = z.infer<typeof RawMuseumMember>;

/** /v2/skyblock/museum: one entry per member whose museum API is on. */
export const RawMuseum = z.object({ members: z.record(z.string(), RawMuseumMember).optional() });
export type RawMuseum = z.infer<typeof RawMuseum>;
