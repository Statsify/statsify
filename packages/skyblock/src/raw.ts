/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Experiment } from "./sections/experiments.js";
import type { Faction } from "./sections/crimson.js";
import type { JacobMedal } from "./sections/jacob.js";
import type { Whisper } from "./sections/hotf.js";

// Hypixel leaves out what a player never touched or an API setting hides.

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

export interface RawDungeonType {
  experience?: number;
  times_played?: Record<string, number>;
  tier_completions?: Record<string, number>;
  highest_tier_completed?: number;
  best_score?: Record<string, number>;
  fastest_time?: Record<string, number>;
  fastest_time_s?: Record<string, number>;
  fastest_time_s_plus?: Record<string, number>;
  watcher_kills?: Record<string, number>;
  // Each also has a "total" or "best" key that isn't a floor.
  mobs_killed?: Record<string, number>;
  most_mobs_killed?: Record<string, number>;
  most_healing?: Record<string, number>;
  milestone_completions?: Record<string, number>;
  [damage: `most_damage_${string}`]: Record<string, number> | undefined;
}

export interface RawExperiment {
  bonus_clicks?: number;
  [tier: `${"attempts" | "claims" | "best_score"}_${number}`]:
    | number
    | undefined;
}

interface RawArmorSet {
  id?: number;
  HELMET?: RawNbt;
  CHESTPLATE?: RawNbt;
  LEGGINGS?: RawNbt;
  BOOTS?: RawNbt;
}

interface RawEquipmentSet {
  id?: number;
  EQUIPMENT_SLOT_1?: RawNbt;
  EQUIPMENT_SLOT_2?: RawNbt;
  EQUIPMENT_SLOT_3?: RawNbt;
  EQUIPMENT_SLOT_4?: RawNbt;
}

// A saved loadout names its pet by the pet's uniqueId, not its uuid.
interface RawLoadout {
  id: number;
  name: string;
  armor_set_id?: number;
  equipment_set_id?: number;
  pet?: string;
  power_stone?: string;
  tuning_points_slot?: number;
}

export interface RawSlayerBoss {
  xp?: number;
  [kills: `boss_kills_tier_${number}`]: number | undefined;
}

export interface RawMember {
  player_id?: string;
  profile?: {
    deletion_notice?: { timestamp: number };
    coop_invitation?: { confirmed: boolean };
    bank_account?: number;
    first_join?: number;
  };
  leveling?: { experience?: number; highest_pet_score?: number };
  currencies?: {
    coin_purse?: number;
    motes_purse?: number;
    essence?: Record<string, { current?: number }>;
  };
  item_data?: { soulflow?: number };
  experimentation?: Partial<Record<Experiment, RawExperiment>> & {
    serums_drank?: number;
  };
  fairy_soul?: { total_collected?: number };
  player_stats?: {
    pets?: { total_exp_gained?: number };
    items_fished?: Record<string, number>;
    // Kills are by mob id, plus "total".
    kills?: Record<string, number>;
    // Deaths are by cause, plus "total".
    deaths?: Record<string, number>;
    highest_damage?: number;
    highest_critical_damage?: number;
    auctions?: {
      created?: number;
      completed?: number;
      won?: number;
      bids?: number;
      highest_bid?: number;
      gold_spent?: number;
      gold_earned?: number;
      fees?: number;
    };
    gifts?: { total_given?: number; total_received?: number };
    mythos?: { kills?: number; burrows_chains_complete?: { total?: number } };
    candy_collected?: { total?: number };
    rift?: { visits?: number; lifetime_motes_earned?: number };
  };
  bestiary?: {
    kills?: {
      last_killed_mob?: string;
      [mob: string]: number | string | undefined;
    };
    deaths?: Record<string, number>;
    milestone?: { last_claimed_milestone?: number };
  };
  // Each fish's count by tier, beside total_caught and lists like rewards
  trophy_fish?: Record<string, unknown>;
  player_data?: {
    experience?: Record<string, number>;
    perks?: Record<string, number | boolean>;
    // A collection found at no tier yet is listed at tier -1.
    unlocked_coll_tiers?: string[];
    reaper_peppers_eaten?: number;
    crafted_generators?: string[]; // "WHEAT_11"
  };
  collection?: Record<string, number>;
  attributes?: { stacks?: Record<string, number> }; // shards syphoned
  shards?: { owned?: { type: string; amount_owned?: number }[] };
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
    bag_contents?: {
      talisman_bag?: RawNbt;
      potion_bag?: RawNbt;
      fishing_bag?: RawNbt;
      quiver?: RawNbt;
      sacks_bag?: RawNbt;
    };
    sacks_counts?: Record<string, number>;
  };
  // The wardrobe moved here from inventory.wardrobe_contents, one set per slot.
  loadout?: {
    armor?: { equipped_set?: number; [slot: `${number}`]: RawArmorSet };
    equipment?: { equipped_set?: number; [slot: `${number}`]: RawEquipmentSet };
    loadouts?: Record<string, RawLoadout>;
  };
  garden_player_data?: {
    copper?: number;
    discovered_greenhouse_crops?: string[];
    analyzed_greenhouse_crops?: string[];
  };
  jacobs_contest?: {
    perks?: { farming_level_cap?: number; double_drops?: number };
    medals_inv?: Partial<Record<JacobMedal, number>>;
    // Each bracket maps to the crops that reached it.
    unique_brackets?: Record<string, string[]>;
    personal_bests?: Record<string, number>;
    contests?: Record<string, unknown>;
  };
  events?: {
    easter?: {
      chocolate?: number;
      total_chocolate?: number;
      chocolate_since_prestige?: number;
      chocolate_level?: number;
      // Each rabbit's times found, beside objects like collected_eggs
      rabbits?: Record<string, unknown>;
      employees?: Record<string, number>;
      time_tower?: { level?: number };
    };
  };
  foraging_core?: {
    whispers?: Partial<
      Record<
        Whisper,
        {
          total?: number;
          [slot: number]: { spent?: number; spent_non_refundable?: number };
        }
      >
    >;
  };
  pets_data?: {
    pets?: RawPet[];
    pet_care?: { pet_types_sacrificed?: string[] };
  };
  dungeons?: {
    dungeon_types?: {
      catacombs?: RawDungeonType;
      master_catacombs?: RawDungeonType;
    };
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
    tuning?: { slot_0?: Record<string, number>; [slot: string]: unknown };
    selected_power?: string;
    highest_magical_power?: number;
  };
  rift?: {
    access?: { consumed_prism?: boolean };
    dead_cats?: { montezuma?: RawPet; found_cats?: string[] };
    enigma?: { found_souls?: string[] };
    gallery?: { secured_trophies?: unknown[] };
  };
  nether_island_player_data?: {
    abiphone?: { active_contacts?: string[] };
    selected_faction?: Faction;
    mages_reputation?: number;
    barbarians_reputation?: number;
    kuudra_completed_tiers?: Record<string, number>;
    dojo?: Record<string, number>;
  };
}

export interface RawProfile {
  profile_id: string;
  cute_name: string;
  selected?: boolean;
  game_mode?: string;
  banking?: { balance?: number };
  // One entry per tier bought
  community_upgrades?: { upgrade_states?: { upgrade: string; tier: number }[] };
  members: Record<string, RawMember>;
}

interface RawDonation {
  donated_time?: number;
  items?: RawNbt;
}

export interface RawMuseumMember {
  value?: number;
  appraisal?: boolean;
  items?: Record<string, RawDonation>;
  special?: RawDonation[];
}

// The museum lists only the members whose museum API is on.
export interface RawMuseum {
  members?: Record<string, RawMuseumMember>;
}

// The Garden is the profile's, so every member reads the same one.
export interface RawGarden {
  garden_experience?: number;
  // Resources are keyed by the crop's item id.
  resources_collected?: Record<string, number>;
  crop_upgrade_levels?: Record<string, number>;
  unlocked_plots_ids?: string[];
  composter_data?: { upgrades?: Record<string, number> };
  commission_data?: {
    // Visits are keyed by visitor id.
    visits?: Record<string, number>;
    completed?: Record<string, number>;
    total_completed?: number;
    unique_npcs_served?: number;
  };
  selected_barn_skin?: string;
  unlocked_barn_skins?: string[];
}

// One inventory slot, as prismarine-nbt's simplify() returns it.
export interface RawItem {
  id: number;
  Count: number;
  Damage: number;
  tag?: {
    display?: { Name?: string; Lore?: string[]; color?: number };
    ExtraAttributes?: {
      id?: string;
      modifier?: string;
      upgrade_level?: number;
      // A few items store it as a long, which the decode leaves as [high, low].
      dungeon_item_level?: number | [number, number];
      rarity_upgrades?: number;
      enchantments?: Record<string, number>;
      talisman_enrichment?: string;
      [key: string]: unknown;
    };
    SkullOwner?: { Properties?: { textures?: { Value: string }[] } };
    ench?: unknown[];
  };
}

export interface RawResourceItem {
  id: string;
  name: string;
  material: string;
  durability?: number;
  tier?: string;
  category?: string;
  color?: string;
  skin?: { value: string };
  origin?: string;
  rift_transferrable?: boolean;
  npc_sell_price?: number;
  glowing?: boolean;
  generator?: string;
  generator_tier?: number;
  museum_data?: {
    category?: string;
    donation_xp?: number;
    armor_set_donation_xp?: Record<string, number>;
  };
}

export interface RawItemsResource {
  lastUpdated: number;
  items: RawResourceItem[];
}

// The auction fields the price builder reads, where bin isn't in docs.json.
export interface RawAuction {
  uuid: string;
  starting_bid: number;
  // docs.json says an object, but Hypixel sends a string.
  item_bytes: string | RawNbt;
  bin?: boolean;
}

export interface RawAuctionsPage {
  totalPages: number;
  lastUpdated: number;
  auctions: RawAuction[];
}

export interface RawBazaar {
  lastUpdated: number;
  products: Record<
    string,
    {
      sell_summary: { pricePerUnit: number }[];
      buy_summary: { pricePerUnit: number }[];
      quick_status: {
        sellPrice: number;
        sellMovingWeek: number;
        buyPrice: number;
        buyMovingWeek: number;
      };
    }
  >;
}
