/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { DungeonClass, Experiment, Faction, JacobMedal, Whisper } from "#types";

// The parts of Hypixel's /v2/skyblock responses this package reads. Everything is optional, since Hypixel leaves out
// whatever a player never touched or an API setting hides.

/** A base64 gzipped NBT blob. */
export interface RawNbt {
  type?: number;
  data: string;
}

export interface RawPet {
  uuid?: string | null;
  uniqueId?: string | null;
  type: string;
  exp: number;
  active: boolean;
  tier: string;
  heldItem?: string | null;
  candyUsed?: number;
  skin?: string | null;
}

export interface RawExperiment {
  [tier: `${"attempts" | "claims" | "best_score"}_${number}`]: number | undefined;
  bonus_clicks?: number;
}

export interface RawDungeonType {
  experience?: number;
  times_played?: Record<string, number>;
  tier_completions?: Record<string, number>;
  highest_tier_completed?: number;
  best_score?: Record<string, number>;
  best_runs?: Record<string, RawDungeonRun[]>; // per floor, a few of the member's best
  fastest_time?: Record<string, number>;
  fastest_time_s?: Record<string, number>;
  fastest_time_s_plus?: Record<string, number>;
  watcher_kills?: Record<string, number>; // per floor, plus "total"
  // Per floor, beside a "total" or "best" that doesn't match the floors
  mobs_killed?: Record<string, number>;
  most_mobs_killed?: Record<string, number>;
  most_healing?: Record<string, number>;
  milestone_completions?: Record<string, number>;
  [damage: `most_damage_${string}`]: Record<string, number> | undefined; // per floor, plus "best"
}

export interface RawDungeonRun {
  timestamp: number;
  score_exploration: number;
  score_speed: number;
  score_skill: number;
  score_bonus: number;
  dungeon_class: DungeonClass;
  elapsed_time: number;
  damage_dealt: number;
  deaths: number;
  secrets_found: number;
}

export interface RawSlayerBoss {
  xp?: number;
  claimed_levels?: Record<string, boolean>; // level_<n>, and level_<n>_special past a boss's usual levels
  [tier: `boss_${"kills" | "attempts"}_tier_${number}`]: number | undefined;
}

/** A song's counts in the harp, by `song_<song>_<count>`. */
export type RawHarp = Record<string, number | string | boolean>;

export interface RawMember {
  player_id?: string;
  profile?: {
    deletion_notice?: { timestamp: number };
    coop_invitation?: { confirmed: boolean; timestamp?: number };
    bank_account?: number;
    first_join?: number;
  };
  leveling?: { experience?: number; highest_pet_score?: number; completed_tasks?: string[] };
  currencies?: { coin_purse?: number; motes_purse?: number; essence?: Record<string, { current?: number }> };
  item_data?: { soulflow?: number };
  experimentation?: Partial<Record<Experiment, RawExperiment>> & { serums_drank?: number };
  fairy_soul?: { total_collected?: number };
  player_stats?: {
    pets?: { total_exp_gained?: number };
    items_fished?: Record<string, number>;
    sea_creature_kills?: number;
    kills?: Record<string, number>; // by mob id, plus "total"
    deaths?: Record<string, number>; // by cause, plus "total"
    highest_damage?: number;
    highest_critical_damage?: number;
    auctions?: Partial<Record<"created" | "completed" | "won" | "bids" | "highest_bid" | "gold_spent" | "gold_earned" | "fees", number>>;
    gifts?: { total_given?: number; total_received?: number };
    mythos?: { kills?: number; burrows_chains_complete?: { total?: number } };
    candy_collected?: { total?: number };
    rift?: { visits?: number; lifetime_motes_earned?: number };
    winter?: Partial<Record<"most_damage_dealt" | "most_snowballs_hit" | "most_magma_damage_dealt" | "most_cannonballs_hit", number>>;
    end_island?: {
      // Each by dragon type, plus "best" (or "total" for the counts)
      dragon_fight?: {
        fastest_kill?: Record<string, number>;
        most_damage?: Record<string, number>;
        highest_rank?: Record<string, number>;
        amount_summoned?: Record<string, number>;
        summoning_eyes_contributed?: Record<string, number>;
        ender_crystals_destroyed?: number;
      };
      special_zealot_loot_collected?: number;
      summoning_eyes_collected?: number;
    };
  };
  bestiary?: { kills?: Record<string, number>; milestone?: { last_claimed_milestone?: number } };
  trophy_fish?: Record<string, unknown> & { rewards?: number[] }; // <fish> and <fish>_<tier> counts, total_caught, rewards…
  player_data?: {
    experience?: Record<string, number>;
    perks?: Record<string, number>;
    reaper_peppers_eaten?: number;
    bee_saliva_eaten?: number;
    isopod_husks_eaten?: number;
    crafted_generators?: string[]; // "WHEAT_11": each minion tier crafted
  };
  collection?: Record<string, number>;
  attributes?: { stacks?: Record<string, number> }; // Hunting shards syphoned, by attribute
  shards?: { owned?: { type: string; amount_owned?: number }[] }; // Hunting shards held, by shard
  inventory?: {
    inv_contents?: RawNbt;
    inv_armor?: RawNbt;
    equipment_contents?: RawNbt;
    ender_chest_contents?: RawNbt;
    personal_vault_contents?: RawNbt;
    wardrobe_contents?: RawNbt;
    wardrobe_equipped_slot?: number;
    backpack_contents?: Record<string, RawNbt>;
    backpack_icons?: Record<string, RawNbt>;
    bag_contents?: Partial<Record<"talisman_bag" | "potion_bag" | "fishing_bag" | "quiver" | "sacks_bag", RawNbt>>;
    sacks_counts?: Record<string, number>;
  };
  // Where the wardrobe moved from inventory.wardrobe_contents: each set by its slot number, one blob per piece
  loadout?: {
    armor?: Record<`${number}`, Partial<Record<"HELMET" | "CHESTPLATE" | "LEGGINGS" | "BOOTS", RawNbt>> & { id?: number }> & {
      equipped_set?: number;
    };
    equipment?: Record<`${number}`, Partial<Record<`EQUIPMENT_SLOT_${1 | 2 | 3 | 4}`, RawNbt>> & { id?: number }> & {
      equipped_set?: number;
    };
    // Saved loadouts, by id: a wardrobe set, an equipment set, a pet (its uniqueId, not its uuid), a Power and a tuning slot
    loadouts?: Record<
      string,
      {
        id: number;
        name: string;
        armor_set_id?: number;
        equipment_set_id?: number;
        pet?: string;
        power_stone?: string;
        tuning_points_slot?: number;
      }
    >;
  };
  garden_player_data?: {
    copper?: number;
    discovered_greenhouse_crops?: string[];
    analyzed_greenhouse_crops?: string[];
    larva_consumed?: number;
    farming_toolkit?: RawToolkit;
  };
  jacobs_contest?: {
    perks?: { farming_level_cap?: number; double_drops?: number };
    medals_inv?: Partial<Record<JacobMedal, number>>;
    unique_brackets?: Record<string, string[]>; // bracket → the crops it was reached on
    personal_bests?: Record<string, number>;
    contests?: Record<string, RawContest>; // "<year>:<month>_<day>:<crop>", the year from 0 and the month from 1
  };
  events?: {
    easter?: {
      chocolate?: number;
      total_chocolate?: number;
      chocolate_since_prestige?: number;
      chocolate_level?: number;
      rabbits?: Record<string, unknown> & { collected_locations?: Record<string, string[]> }; // rabbit → times found
      refined_dark_cacao_truffles?: number;
      employees?: Record<string, number>;
      time_tower?: { level?: number };
    };
  };
  foraging?: {
    songs?: { harp?: RawHarp };
    fish_family?: string[];
    hina?: { tasks?: { completed_tasks?: string[] } };
    tree_gifts?: Record<string, unknown>; // gifts by tree, plus milestone_tier_claimed
    starlyn?: { personal_bests?: Record<string, number> };
    hunting_toolkit?: RawToolkit;
  };
  quests?: { harp_quest?: RawHarp }; // where the harp was before foraging.songs
  winter_player_data?: { refined_jyrre_uses?: number };
  foraging_core?: {
    whispers?: Partial<
      Record<Whisper, { total?: number; [slot: number]: { spent?: number; spent_non_refundable?: number } | undefined }>
    >;
  };
  pets_data?: { pets?: RawPet[]; pet_care?: { pet_types_sacrificed?: string[] } };
  dungeons?: {
    dungeon_types?: { catacombs?: RawDungeonType; master_catacombs?: RawDungeonType };
    player_classes?: Record<string, { experience?: number }>;
    selected_dungeon_class?: string;
    secrets?: number;
  };
  slayer?: { slayer_bosses?: Record<string, RawSlayerBoss> };
  skill_tree?: {
    nodes?: Record<string, Record<string, number | boolean>>;
    tokens_spent?: Record<string, number>;
    experience?: Record<string, number>;
    selected_ability?: Record<string, string>;
    selected_skill_tree_slot?: Record<string, number>;
  };
  mining_core?: {
    experience?: number;
    nodes?: Record<string, number | boolean>;
    tokens_spent?: number;
    selected_pickaxe_ability?: string;
    crystals?: Record<string, { total_found?: number; total_placed?: number }>;
    biomes?: { goblin?: { king_quests_completed?: number } };
    [powder: `powder_${string}`]: number | undefined;
  };
  glacite_player_data?: {
    corpses_looted?: Record<string, number>;
    fossils_donated?: string[];
    fossil_dust?: number;
    mineshafts_entered?: number;
  };
  accessory_bag_storage?: {
    tuning?: Record<string, unknown> & { slot_0?: Record<string, number> };
    selected_power?: string;
    highest_magical_power?: number;
  };
  rift?: {
    access?: { consumed_prism?: boolean };
    dead_cats?: { montezuma?: RawPet; found_cats?: string[] };
    enigma?: { found_souls?: string[] };
    gallery?: { secured_trophies?: unknown[] };
    inventory?: { inv_contents?: RawNbt; ender_chest_contents?: RawNbt };
  };
  nether_island_player_data?: {
    abiphone?: { active_contacts?: string[] };
    selected_faction?: Faction;
    mages_reputation?: number;
    barbarians_reputation?: number;
    kuudra_completed_tiers?: Record<string, number>; // <tier> completions, highest_wave_<tier>
    dojo?: Record<string, number>; // dojo_points_<test>, dojo_time_<test>
  };
}

export interface RawProfile {
  profile_id: string;
  cute_name: string;
  selected?: boolean;
  game_mode?: string;
  banking?: { balance?: number };
  community_upgrades?: { upgrade_states?: { upgrade: string; tier: number }[] }; // one entry per tier bought
  members: Record<string, RawMember>;
}

export interface RawMuseumMember {
  value?: number;
  appraisal?: boolean;
  items?: Record<string, { donated_time?: number; items?: RawNbt }>;
  special?: { donated_time?: number; items?: RawNbt }[];
}

export interface RawContest {
  collected: number;
  claimed_position?: number; // from 0
  claimed_participants?: number;
  claimed_medal?: string;
}

/** A toolkit's tools by kind (a crop, TRAP…), each a list of bare ExtraAttributes blobs, beside IN_USE and IS_UNLOCKED. */
export type RawToolkit = Record<string, unknown>;

/** /v2/skyblock/museum: one entry per member whose museum API is on. */
export interface RawMuseum {
  members?: Record<string, RawMuseumMember>;
}

/** /v2/skyblock/garden's `garden`: the profile's, so its members share it. */
export interface RawGarden {
  garden_experience?: number;
  resources_collected?: Record<string, number>; // by the crop's item id
  crop_upgrade_levels?: Record<string, number>;
  unlocked_plots_ids?: string[];
  composter_data?: { upgrades?: Record<string, number> };
  commission_data?: {
    visits?: Record<string, number>; // by visitor id
    completed?: Record<string, number>;
    total_completed?: number;
    unique_npcs_served?: number;
  };
  selected_barn_skin?: string;
  unlocked_barn_skins?: string[];
}

/** One /v2/skyblock/auctions entry, with only the fields the price builder reads. `bin` isn't in docs.json. */
export interface RawAuction {
  uuid: string;
  starting_bid: number;
  item_bytes: string | RawNbt; // a string in practice; docs.json says an object
  bin?: boolean;
}

export interface RawAuctionsPage {
  totalPages: number;
  lastUpdated: number;
  auctions: RawAuction[];
}

/** /v2/skyblock/bazaar */
export interface RawBazaar {
  lastUpdated: number;
  products: Record<
    string,
    {
      sell_summary: { pricePerUnit: number }[];
      buy_summary: { pricePerUnit: number }[];
      quick_status: { sellPrice: number; sellMovingWeek: number; buyPrice: number; buyMovingWeek: number };
    }
  >;
}

interface RawPerk {
  name: string;
  description: string;
}

/** /v2/resources/skyblock/election (keyless), with only what the mayor's view reads. */
export interface RawElection {
  mayor: {
    name: string;
    perks: RawPerk[];
    minister?: { name: string; perk: RawPerk };
  };
}

/** /v2/resources/skyblock/bingo (keyless): this month's card. */
export interface RawBingoResource {
  id: number;
  name: string;
  start: number;
  end: number;
  goals: {
    id: string;
    name: string;
    lore: string;
    // Community goals only: the whole network's progress and the amounts each tier needs
    tiers?: number[];
    progress?: number;
  }[];
}

/** /v2/skyblock/bingo: each Bingo event the player took part in, keyed by the event's id. */
export interface RawPlayerBingo {
  events: { key: number; points: number; completed_goals: string[] }[];
}
