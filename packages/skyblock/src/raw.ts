/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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

export interface RawDungeonType {
  experience?: number;
  times_played?: Record<string, number>;
  tier_completions?: Record<string, number>;
  highest_tier_completed?: number;
  best_score?: Record<string, number>;
  fastest_time?: Record<string, number>;
  fastest_time_s?: Record<string, number>;
  fastest_time_s_plus?: Record<string, number>;
  watcher_kills?: Record<string, number>; // per floor, plus "total"
  [damage: `most_damage_${string}`]: Record<string, number> | undefined; // per floor, plus "best"
}

export interface RawSlayerBoss {
  xp?: number;
  [tier: `boss_kills_tier_${number}`]: number | undefined;
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
  currencies?: { coin_purse?: number; essence?: Record<string, { current?: number }> };
  fairy_soul?: { total_collected?: number };
  player_data?: { experience?: Record<string, number>; perks?: Record<string, number> };
  collection?: Record<string, number>;
  inventory?: {
    inv_contents?: RawNbt;
    inv_armor?: RawNbt;
    equipment_contents?: RawNbt;
    ender_chest_contents?: RawNbt;
    personal_vault_contents?: RawNbt;
    wardrobe_contents?: RawNbt;
    wardrobe_equipped_slot?: number;
    backpack_contents?: Record<string, RawNbt>;
    bag_contents?: Partial<Record<"talisman_bag" | "potion_bag" | "fishing_bag" | "quiver" | "sacks_bag", RawNbt>>;
    sacks_counts?: Record<string, number>;
  };
  jacobs_contest?: { perks?: { farming_level_cap?: number } };
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
    [powder: `powder_${string}`]: number | undefined;
  };
  glacite_player_data?: { corpses_looted?: Record<string, number>; fossils_donated?: string[]; mineshafts_entered?: number };
  accessory_bag_storage?: {
    tuning?: Record<string, unknown> & { slot_0?: Record<string, number> };
    selected_power?: string;
    highest_magical_power?: number;
  };
  rift?: { access?: { consumed_prism?: boolean } };
  nether_island_player_data?: { abiphone?: { active_contacts?: string[] } };
}

export interface RawProfile {
  profile_id: string;
  cute_name: string;
  selected?: boolean;
  game_mode?: string;
  banking?: { balance?: number };
  members: Record<string, RawMember>;
}

export interface RawMuseumMember {
  value?: number;
  appraisal?: boolean;
  items?: Record<string, { donated_time?: number; items?: RawNbt }>;
  special?: { donated_time?: number; items?: RawNbt }[];
}

/** /v2/skyblock/museum: one entry per member whose museum API is on. */
export interface RawMuseum {
  members?: Record<string, RawMuseumMember>;
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
