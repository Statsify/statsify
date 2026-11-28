/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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
  watcher_kills?: Record<string, number>; // per floor, plus "total"
  [damage: `most_damage_${string}`]: Record<string, number> | undefined;
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
    essence?: Record<string, { current?: number }>;
  };
  fairy_soul?: { total_collected?: number };
  player_stats?: { pets?: { total_exp_gained?: number } };
  player_data?: {
    experience?: Record<string, number>;
    perks?: Record<string, number | boolean>;
  };
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
    bag_contents?: {
      talisman_bag?: RawNbt;
      potion_bag?: RawNbt;
      fishing_bag?: RawNbt;
      quiver?: RawNbt;
      sacks_bag?: RawNbt;
    };
    sacks_counts?: Record<string, number>;
  };
  jacobs_contest?: { perks?: { farming_level_cap?: number } };
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
    [powder: `powder_${string}`]: number | undefined;
  };
  glacite_player_data?: {
    corpses_looted?: Record<string, number>;
    fossils_donated?: string[];
    mineshafts_entered?: number;
  };
  accessory_bag_storage?: {
    tuning?: { slot_0?: Record<string, number>; [slot: string]: unknown };
    selected_power?: string;
    highest_magical_power?: number;
  };
  rift?: {
    access?: { consumed_prism?: boolean };
    dead_cats?: { montezuma?: RawPet };
  };
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

// One inventory slot, as prismarine-nbt's simplify() returns it.
export interface RawItem {
  id: number;
  Count: number;
  Damage: number;
  tag?: {
    display?: { Name?: string; Lore?: string[]; color?: number };
    ExtraAttributes?: {
      id?: string;
      uuid?: string;
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
