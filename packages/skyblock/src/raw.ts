/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUNGEON_CLASSES, EXPERIMENTS, FACTIONS, JACOB_MEDALS, WHISPERS } from "#types";
import { z } from "zod";

// The parts of Hypixel's /v2/skyblock responses this package reads, all optional since Hypixel leaves out what a player
// never touched or an API setting hides. Keys we don't read pass, and callers keep Hypixel's object, not the parsed copy.

const numbers = z.record(z.string(), z.number());

/** A map keyed by `keys`, each optional, which passes keys Hypixel adds beside them. */
const keyedBy = <Key extends string, Value extends z.ZodType>(keys: readonly Key[], value: Value) =>
  z.object(Object.fromEntries(keys.map((key) => [key, value.optional()])) as { [K in Key]: z.ZodOptional<Value> });

/** A loadout's sets by slot number, beside the slot of the set worn. */
const setsBySlot = <Pieces extends z.ZodRawShape>(pieces: Pieces) =>
  z
    .object({ equipped_set: z.number().optional() })
    .and(z.looseRecord(z.templateLiteral([z.number()]), z.object({ id: z.number().optional(), ...pieces })));

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

export const RawExperiment = z
  .object({ bonus_clicks: z.number().optional() })
  .and(z.looseRecord(z.templateLiteral([z.enum(["attempts", "claims", "best_score"]), "_", z.number()]), z.number().optional()));
export type RawExperiment = z.infer<typeof RawExperiment>;

export const RawDungeonRun = z.object({
  timestamp: z.number(),
  score_exploration: z.number(),
  score_speed: z.number(),
  score_skill: z.number(),
  score_bonus: z.number(),
  dungeon_class: z.enum(DUNGEON_CLASSES),
  elapsed_time: z.number(),
  damage_dealt: z.number(),
  deaths: z.number(),
  secrets_found: z.number(),
});
export type RawDungeonRun = z.infer<typeof RawDungeonRun>;

export const RawDungeonType = z
  .object({
    experience: z.number().optional(),
    times_played: numbers.optional(),
    tier_completions: numbers.optional(),
    highest_tier_completed: z.number().optional(),
    best_score: numbers.optional(),
    best_runs: z.record(z.string(), z.array(RawDungeonRun)).optional(), // per floor, a few of the member's best
    fastest_time: numbers.optional(),
    fastest_time_s: numbers.optional(),
    fastest_time_s_plus: numbers.optional(),
    watcher_kills: numbers.optional(), // per floor, plus "total"
    // Per floor, beside a "total" or "best" that doesn't match the floors
    mobs_killed: numbers.optional(),
    most_mobs_killed: numbers.optional(),
    most_healing: numbers.optional(),
    milestone_completions: numbers.optional(),
  })
  // Per floor, plus "best"
  .and(z.looseRecord(z.templateLiteral(["most_damage_", z.string()]), numbers.optional()));
export type RawDungeonType = z.infer<typeof RawDungeonType>;

export const RawSlayerBoss = z
  .object({
    xp: z.number().optional(),
    // level_<n>, and level_<n>_special past a boss's usual levels
    claimed_levels: z.record(z.string(), z.boolean()).optional(),
  })
  .and(z.looseRecord(z.templateLiteral(["boss_", z.enum(["kills", "attempts"]), "_tier_", z.number()]), z.number().optional()));
export type RawSlayerBoss = z.infer<typeof RawSlayerBoss>;

/** A song's counts in the harp, by `song_<song>_<count>`. */
export const RawHarp = z.record(z.string(), z.union([z.number(), z.string(), z.boolean()]));
export type RawHarp = z.infer<typeof RawHarp>;

export const RawContest = z.object({
  collected: z.number(),
  claimed_position: z.number().optional(), // from 0
  claimed_participants: z.number().optional(),
  claimed_medal: z.string().optional(),
});
export type RawContest = z.infer<typeof RawContest>;

/** A toolkit's tools by kind (a crop, TRAP…), each a list of bare ExtraAttributes blobs, beside IN_USE and IS_UNLOCKED. */
export const RawToolkit = z.record(z.string(), z.unknown());
export type RawToolkit = z.infer<typeof RawToolkit>;

export const RawMember = z.object({
  player_id: z.string().optional(),
  profile: z
    .object({
      deletion_notice: z.object({ timestamp: z.number() }).optional(),
      coop_invitation: z.object({ confirmed: z.boolean(), timestamp: z.number().optional() }).optional(),
      bank_account: z.number().optional(),
      first_join: z.number().optional(),
    })
    .optional(),
  leveling: z.object({ experience: z.number().optional(), highest_pet_score: z.number().optional() }).optional(),
  currencies: z
    .object({
      coin_purse: z.number().optional(),
      motes_purse: z.number().optional(),
      essence: z.record(z.string(), z.object({ current: z.number().optional() })).optional(),
    })
    .optional(),
  item_data: z.object({ soulflow: z.number().optional() }).optional(),
  experimentation: keyedBy(EXPERIMENTS, RawExperiment).extend({ serums_drank: z.number().optional() }).optional(),
  fairy_soul: z.object({ total_collected: z.number().optional() }).optional(),
  player_stats: z
    .object({
      pets: z.object({ total_exp_gained: z.number().optional() }).optional(),
      items_fished: numbers.optional(),
      sea_creature_kills: z.number().optional(),
      kills: numbers.optional(), // by mob id, plus "total"
      deaths: numbers.optional(), // by cause, plus "total"
      highest_damage: z.number().optional(),
      highest_critical_damage: z.number().optional(),
      auctions: z
        .object({
          created: z.number().optional(),
          completed: z.number().optional(),
          won: z.number().optional(),
          bids: z.number().optional(),
          highest_bid: z.number().optional(),
          gold_spent: z.number().optional(),
          gold_earned: z.number().optional(),
          fees: z.number().optional(),
        })
        .optional(),
      gifts: z.object({ total_given: z.number().optional(), total_received: z.number().optional() }).optional(),
      mythos: z
        .object({
          kills: z.number().optional(),
          burrows_chains_complete: z.object({ total: z.number().optional() }).optional(),
        })
        .optional(),
      candy_collected: z.object({ total: z.number().optional() }).optional(),
      rift: z.object({ visits: z.number().optional(), lifetime_motes_earned: z.number().optional() }).optional(),
      winter: z
        .object({
          most_damage_dealt: z.number().optional(),
          most_snowballs_hit: z.number().optional(),
          most_magma_damage_dealt: z.number().optional(),
          most_cannonballs_hit: z.number().optional(),
        })
        .optional(),
      end_island: z
        .object({
          // Each by dragon type, plus "best" (or "total" for the counts)
          dragon_fight: z
            .object({
              fastest_kill: numbers.optional(),
              most_damage: numbers.optional(),
              highest_rank: numbers.optional(),
              amount_summoned: numbers.optional(),
              summoning_eyes_contributed: numbers.optional(),
              ender_crystals_destroyed: z.number().optional(),
            })
            .optional(),
          special_zealot_loot_collected: z.number().optional(),
          summoning_eyes_collected: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  bestiary: z
    .object({
      kills: z.object({ last_killed_mob: z.string().optional() }).catchall(z.number()).optional(),
      deaths: numbers.optional(),
      milestone: z.object({ last_claimed_milestone: z.number().optional() }).optional(),
    })
    .optional(),
  // <fish> and <fish>_<tier> counts, total_caught, rewards…
  trophy_fish: z.object({ rewards: z.array(z.number()).optional() }).catchall(z.unknown()).optional(),
  player_data: z
    .object({
      experience: numbers.optional(),
      perks: z.object({ fairies_refund_processed: z.boolean().optional() }).catchall(z.number()).optional(),
      unlocked_coll_tiers: z.array(z.string()).optional(), // <collection>_<tier>, with -1 for one found at no tier yet
      reaper_peppers_eaten: z.number().optional(),
      bee_saliva_eaten: z.number().optional(),
      isopod_husks_eaten: z.number().optional(),
      crafted_generators: z.array(z.string()).optional(), // "WHEAT_11": each minion tier crafted
    })
    .optional(),
  collection: numbers.optional(),
  attributes: z.object({ stacks: numbers.optional() }).optional(), // Hunting shards syphoned, by attribute
  // Hunting shards held, by shard
  shards: z.object({ owned: z.array(z.object({ type: z.string(), amount_owned: z.number().optional() })).optional() }).optional(),
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
      backpack_icons: z.record(z.string(), RawNbt).optional(),
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
  // Where the wardrobe moved from inventory.wardrobe_contents: each set by its slot number, one blob per piece
  loadout: z
    .object({
      armor: setsBySlot({
        HELMET: RawNbt.optional(),
        CHESTPLATE: RawNbt.optional(),
        LEGGINGS: RawNbt.optional(),
        BOOTS: RawNbt.optional(),
      }).optional(),
      equipment: setsBySlot({
        EQUIPMENT_SLOT_1: RawNbt.optional(),
        EQUIPMENT_SLOT_2: RawNbt.optional(),
        EQUIPMENT_SLOT_3: RawNbt.optional(),
        EQUIPMENT_SLOT_4: RawNbt.optional(),
      }).optional(),
      // Saved loadouts, by id: a wardrobe set, an equipment set, a pet (its uniqueId, not its uuid), a Power and a tuning slot
      loadouts: z
        .record(
          z.string(),
          z.object({
            id: z.number(),
            name: z.string(),
            armor_set_id: z.number().optional(),
            equipment_set_id: z.number().optional(),
            pet: z.string().optional(),
            power_stone: z.string().optional(),
            tuning_points_slot: z.number().optional(),
          })
        )
        .optional(),
    })
    .optional(),
  garden_player_data: z
    .object({
      copper: z.number().optional(),
      discovered_greenhouse_crops: z.array(z.string()).optional(),
      analyzed_greenhouse_crops: z.array(z.string()).optional(),
      larva_consumed: z.number().optional(),
      farming_toolkit: RawToolkit.optional(),
    })
    .optional(),
  jacobs_contest: z
    .object({
      perks: z.object({ farming_level_cap: z.number().optional(), double_drops: z.number().optional() }).optional(),
      medals_inv: keyedBy(JACOB_MEDALS, z.number()).optional(),
      unique_brackets: z.record(z.string(), z.array(z.string())).optional(), // bracket → the crops it was reached on
      personal_bests: numbers.optional(),
      // "<year>:<month>_<day>:<crop>", the year from 0 and the month from 1
      contests: z.record(z.string(), RawContest).optional(),
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
          // rabbit → times found
          rabbits: z
            .object({ collected_locations: z.record(z.string(), z.array(z.string())).optional() })
            .catchall(z.unknown())
            .optional(),
          refined_dark_cacao_truffles: z.number().optional(),
          employees: numbers.optional(),
          time_tower: z.object({ level: z.number().optional() }).optional(),
        })
        .optional(),
    })
    .optional(),
  foraging: z
    .object({
      songs: z.object({ harp: RawHarp.optional() }).optional(),
      fish_family: z.array(z.string()).optional(),
      hina: z.object({ tasks: z.object({ completed_tasks: z.array(z.string()).optional() }).optional() }).optional(),
      tree_gifts: z.record(z.string(), z.unknown()).optional(), // gifts by tree, plus milestone_tier_claimed
      starlyn: z.object({ personal_bests: numbers.optional() }).optional(),
      hunting_toolkit: RawToolkit.optional(),
    })
    .optional(),
  quests: z.object({ harp_quest: RawHarp.optional() }).optional(), // where the harp was before foraging.songs
  winter_player_data: z.object({ refined_jyrre_uses: z.number().optional() }).optional(),
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
      biomes: z.object({ goblin: z.object({ king_quests_completed: z.number().optional() }).optional() }).optional(),
    })
    .and(z.looseRecord(z.templateLiteral(["powder_", z.string()]), z.number().optional()))
    .optional(),
  glacite_player_data: z
    .object({
      corpses_looted: numbers.optional(),
      fossils_donated: z.array(z.string()).optional(),
      fossil_dust: z.number().optional(),
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
      dead_cats: z.object({ montezuma: RawPet.optional(), found_cats: z.array(z.string()).optional() }).optional(),
      enigma: z.object({ found_souls: z.array(z.string()).optional() }).optional(),
      gallery: z.object({ secured_trophies: z.array(z.unknown()).optional() }).optional(),
      inventory: z.object({ inv_contents: RawNbt.optional(), ender_chest_contents: RawNbt.optional() }).optional(),
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
  // One entry per tier bought
  community_upgrades: z
    .object({ upgrade_states: z.array(z.object({ upgrade: z.string(), tier: z.number() })).optional() })
    .optional(),
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

/** /v2/skyblock/garden's `garden`: the profile's, so its members share it. */
export const RawGarden = z.object({
  garden_experience: z.number().optional(),
  resources_collected: numbers.optional(), // by the crop's item id
  crop_upgrade_levels: numbers.optional(),
  unlocked_plots_ids: z.array(z.string()).optional(),
  composter_data: z.object({ upgrades: numbers.optional() }).optional(),
  commission_data: z
    .object({
      visits: numbers.optional(), // by visitor id
      completed: numbers.optional(),
      total_completed: z.number().optional(),
      unique_npcs_served: z.number().optional(),
    })
    .optional(),
  selected_barn_skin: z.string().optional(),
  unlocked_barn_skins: z.array(z.string()).optional(),
});
export type RawGarden = z.infer<typeof RawGarden>;

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

const RawPerk = z.object({ name: z.string(), description: z.string() });

/** /v2/resources/skyblock/election (keyless), with only what the mayor's view reads. */
export const RawElection = z.object({
  mayor: z.object({
    election: z.object({ year: z.number() }),
    name: z.string(),
    perks: z.array(RawPerk),
    minister: z.object({ name: z.string(), perk: RawPerk }).optional(),
  }),
});
export type RawElection = z.infer<typeof RawElection>;

/** /v2/resources/skyblock/bingo (keyless): this month's card. */
export const RawBingoResource = z.object({
  id: z.number(),
  name: z.string(),
  start: z.number(),
  end: z.number(),
  goals: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      lore: z.string().optional(), // Hypixel's docs require only the id and name
      // Community goals only: the whole network's progress and the amounts each tier needs
      tiers: z.array(z.number()).optional(),
      progress: z.number().optional(),
    })
  ),
});
export type RawBingoResource = z.infer<typeof RawBingoResource>;

/** /v2/skyblock/bingo: each Bingo event the player took part in, keyed by the event's id. */
export const RawPlayerBingo = z.object({
  events: z.array(z.object({ key: z.number(), points: z.number(), completed_goals: z.array(z.string()) })),
});
export type RawPlayerBingo = z.infer<typeof RawPlayerBingo>;
