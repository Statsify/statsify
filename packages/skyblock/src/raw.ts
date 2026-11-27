/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FACTIONS, JACOB_MEDALS, WHISPERS } from "#types";
import { z } from "zod";

// The parts of Hypixel's /v2/skyblock responses this package reads. Everything is optional, since Hypixel leaves out
// whatever a player never touched or an API setting hides. Keys we don't read pass the check, since Hypixel adds them
// all the time; callers check a response and then keep Hypixel's own object, not the parsed copy.

const numbers = z.record(z.string(), z.number());

/** A map keyed by `keys`, each optional, which passes keys Hypixel adds beside them. */
const keyedBy = <Key extends string, Value extends z.ZodType>(keys: readonly Key[], value: Value) =>
  z.object(Object.fromEntries(keys.map((key) => [key, value.optional()])) as { [K in Key]: z.ZodOptional<Value> });

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

export const RawDungeonType = z
  .object({
    experience: z.number().optional(),
    times_played: numbers.optional(),
    tier_completions: numbers.optional(),
    highest_tier_completed: z.number().optional(),
    best_score: numbers.optional(),
    fastest_time: numbers.optional(),
    fastest_time_s: numbers.optional(),
    fastest_time_s_plus: numbers.optional(),
    watcher_kills: numbers.optional(), // per floor, plus "total"
  })
  // Per floor, plus "best"
  .and(z.looseRecord(z.templateLiteral(["most_damage_", z.string()]), numbers.optional()));
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
  currencies: z
    .object({
      coin_purse: z.number().optional(),
      essence: z.record(z.string(), z.object({ current: z.number().optional() })).optional(),
    })
    .optional(),
  fairy_soul: z.object({ total_collected: z.number().optional() }).optional(),
  player_stats: z
    .object({
      pets: z.object({ total_exp_gained: z.number().optional() }).optional(),
      items_fished: numbers.optional(),
      sea_creature_kills: z.number().optional(),
    })
    .optional(),
  bestiary: z.object({ kills: z.object({ last_killed_mob: z.string().optional() }).catchall(z.number()).optional() }).optional(),
  trophy_fish: z.record(z.string(), z.unknown()).optional(), // <fish> and <fish>_<tier> counts, plus total_caught, rewards…
  player_data: z
    .object({
      experience: numbers.optional(),
      perks: z.object({ fairies_refund_processed: z.boolean().optional() }).catchall(z.number()).optional(),
    })
    .optional(),
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
  jacobs_contest: z
    .object({
      perks: z.object({ farming_level_cap: z.number().optional(), double_drops: z.number().optional() }).optional(),
      medals_inv: keyedBy(JACOB_MEDALS, z.number()).optional(),
      unique_brackets: z.record(z.string(), z.array(z.string())).optional(), // bracket → the crops it was reached on
      personal_bests: numbers.optional(),
      contests: z.record(z.string(), z.unknown()).optional(), // "<year>:<month>_<day>:<crop>" → the entry
    })
    .optional(),
  events: z
    .object({
      easter: z
        .object({
          chocolate: z.number().optional(),
          total_chocolate: z.number().optional(),
          chocolate_since_prestige: z.number().optional(),
          chocolate_level: z.number().optional(),
          rabbits: z.record(z.string(), z.unknown()).optional(), // rabbit → times found, plus collected_eggs
          employees: numbers.optional(),
          time_tower: z.object({ level: z.number().optional() }).optional(),
        })
        .optional(),
    })
    .optional(),
  foraging_core: z
    .object({
      whispers: keyedBy(
        WHISPERS,
        z
          .object({ total: z.number().optional() })
          .and(
            z.looseRecord(
              z.number(),
              z.object({ spent: z.number().optional(), spent_non_refundable: z.number().optional() }).optional()
            )
          )
      ).optional(),
    })
    .optional(),
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
      crystals: z.record(z.string(), z.object({ total_found: z.number().optional(), total_placed: z.number().optional() })).optional(),
    })
    .and(z.looseRecord(z.templateLiteral(["powder_", z.string()]), z.number().optional()))
    .optional(),
  glacite_player_data: z
    .object({
      corpses_looted: numbers.optional(),
      fossils_donated: z.array(z.string()).optional(),
      mineshafts_entered: z.number().optional(),
    })
    .optional(),
  accessory_bag_storage: z
    .object({
      tuning: z.object({ slot_0: numbers.optional() }).catchall(z.unknown()).optional(),
      selected_power: z.string().optional(),
      highest_magical_power: z.number().optional(),
    })
    .optional(),
  rift: z
    .object({
      access: z.object({ consumed_prism: z.boolean().optional() }).optional(),
      dead_cats: z.object({ montezuma: RawPet.optional() }).optional(),
    })
    .optional(),
  nether_island_player_data: z
    .object({
      abiphone: z.object({ active_contacts: z.array(z.string()).optional() }).optional(),
      selected_faction: z.enum(FACTIONS).optional(),
      mages_reputation: z.number().optional(),
      barbarians_reputation: z.number().optional(),
      kuudra_completed_tiers: numbers.optional(), // <tier> completions, highest_wave_<tier>
      dojo: numbers.optional(), // dojo_points_<test>, dojo_time_<test>
    })
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

/**
 * /v2/skyblock/profiles, checked on arrival for what every lookup reads: each profile's own fields, and what finding a
 * profile, its summary and the API settings read of its members. Each section checks the rest as it reads it.
 */
export const RawProfilesResponse = z.object({
  profiles: z
    .array(
      RawProfile.extend({
        members: z.record(
          z.string(),
          RawMember.pick({
            collection: true,
            currencies: true,
            fairy_soul: true,
            inventory: true,
            leveling: true,
            player_data: true,
            player_id: true,
            profile: true,
          })
        ),
      })
    )
    .nullish(),
});

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

/** One /v2/skyblock/auctions entry, with only the fields the price builder reads. `bin` isn't in docs.json. */
export const RawAuction = z.object({
  uuid: z.string(),
  starting_bid: z.number(),
  item_bytes: z.union([z.string(), RawNbt]), // a string in practice; docs.json says an object
  bin: z.boolean().optional(),
});
export type RawAuction = z.infer<typeof RawAuction>;

export const RawAuctionsPage = z.object({ totalPages: z.number(), lastUpdated: z.number(), auctions: z.array(RawAuction) });
export type RawAuctionsPage = z.infer<typeof RawAuctionsPage>;

const RawOrders = z.array(z.object({ pricePerUnit: z.number() }));

/** /v2/skyblock/bazaar */
export const RawBazaar = z.object({
  lastUpdated: z.number(),
  products: z.record(
    z.string(),
    z.object({
      sell_summary: RawOrders,
      buy_summary: RawOrders,
      quick_status: z.object({ sellPrice: z.number(), sellMovingWeek: z.number(), buyPrice: z.number(), buyMovingWeek: z.number() }),
    })
  ),
});
export type RawBazaar = z.infer<typeof RawBazaar>;
