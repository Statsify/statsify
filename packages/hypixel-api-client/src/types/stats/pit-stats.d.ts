/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BasicStats, IntRange, NBTData } from "../helpers";

export enum PitGenesisFactions {
  angel = "angel",
  demon = "demon",
}

export interface PitContract {
  /**
   * either EASY or HARD, representing a Novice or Big Time contract respectively.
   */
  difficulty: "EASY" | "HARD";

  /**
   * Amount of gold the player earned from completing the contract.
   */
  gold_reward: number;

  /**
   * Object. Contains a key representing the objective the player needs to complete for the contract.
   */
  requirements: Record<string, number>;

  /**
   * Object. Contains a key representing the progress the player has already made in the contract.
   */
  progress: Record<string, number>;

  /**
   * The number of Chunks of Vile the player will receive if they complete the contract.
   */
  chunk_of_viles_reward: number;

  completion_date: 0;

  /**
   * How many ticks are left in the contract's 5-minute timer. One tick is equal to 0.05 seconds.
   */
  remaining_ticks: number;

  /**
   * Description of the contract's objective.
   */
  key: string;
}

export interface PitBounty {
  /**
   * The gold amount of the bounty bump
   */
  amount: number;

  /**
   * @deprecated Does not count down and is always an unreasonably high number
   */
  remainingTicks: number;

  /**
   * The Unix timestamp of when the player received the bounty
   */
  timestamp: number;
}

interface PitShopsThrottle {
  [key: `${"buyer_" | ""}${"Hay" | "Bread" | "Fish"}`]: {
    /**
     * The latest date the player sold items to that NPC.
     */
    lastEpochDay: number;

    /**
     * The number of items that were sold on `lastEpochDay`.
     */
    count: number;
  };
}

export interface PitStatsPTL {
  assists: number;
  cash_earned: number;
  damage_dealt: number;
  damage_received: number;
  deaths: number;
  gapple_eaten: number;
  joins: number;
  jumped_into_pit: number;
  kills: number;
  left_clicks: number;
  max_streak: number;
  melee_damage_dealt: number;
  melee_damage_received: number;
  playtime_minutes: number;
  sword_hits: number;
  arrow_hits: number;
  arrows_fired: number;
  bow_damage_dealt: number;
  bow_damage_received: number;
  ghead_eaten: number;
  launched_by_launchers: number;
  contracts_completed: number;
  contracts_started: number;
  fishing_rod_launched: number;
  chat_messages: number;
  diamond_items_purchased: number;
  enderchest_opened: number;
  fished_anything: number;
  wheat_farmed: number;
  sewer_treasures_found: number;
  blocks_placed: number;
  blocks_broken: number;
  king_quest_completion: number;
  lava_bucket_emptied: number;

  /**
   * Gold earned from picking up ingots.
   */
  ingots_cash: number;

  /**
   * Total number of gold ingots picked up.
   */
  ingots_picked_up: number;

  /**
   * Total amount of HP healed with the Vampire perk.
   */
  vampire_healed_hp: number;

  /**
   * Total number of Rage Potatoes eaten from the Rage Pit event.
   */
  rage_potatoes_eaten: number;

  enchanted_tier1: number;
  enchanted_tier2: number;
  enchanted_tier3: number;

  soups_drank: number;
  night_quests_completed: number;
  obsidian_broken: number;

  /**
   * Number of diamond armor pieces obtained from the Lucky Diamond perk.
   */
  lucky_diamond_pieces: number;

  /**
   * Number of arrows earned from the Spammer perk.
   */
  endless_quiver_arrows: number;

  /**
   * Amount of gold earned from the Trickle Down perk.
   */
  extra_from_trickle_down: number;

  /**
   * Number of bounties worth 500g or greater claimed with the Bounty Hunter perk.
   */
  bounties_of_500g_with_bh: number;

  fishes_fished: number;
  rambo_kills: number;
  launched_by_angel_spawn: number;
  launched_by_demon_spawn: number;
  rage_pants_crafted: number;
  gold_from_farming: number;
  dark_pants_crated: number;
  dark_pants_t2: number;
  hidden_jewel_triggers: number;
  gold_from_selling_fish: number;
}

export interface PitOutgoingOffer {
  /**
   * Unix timestamp of when the command was sent.
   */
  issued_ms: number;

  /**
   *  The price, in gold, the recipient will need to pay to receive the item.
   */
  gold: number;

  /**
   * Object. Contains a byte array of the object being sent.
   */
  item: NBTData;

  /**
   * Unknown use; seemingly always −1, regardless whether the item is pants or not.
   */
  pants: -1;

  /**
   * UUID of the trade. Can be used in the /inspectoffer [uuid] command to open the offer GUI without needing to click.
   */
  uuid: string;

  /**
   * Unknown use; seemingly always 0, regardless of how many pants are included in the offer.
   */
  pants_count: 0;

  /**
   *  UUID of the recipient.
   */
  target: string;
}

export interface PitKingsQuest {
  kills: number;
  renown: number;
  last_completed: number;
  last_accepted: number;
}

export interface PitUnlocks {
  tier: number;
  acquireDate: number;
  key: string;
}

export interface PitPrestiges {
  index: IntRange<1, 50>;
  xp_on_prestige: number;
  timestamp: number;
}

export interface PitRenownUnlocks {
  tier: number;
  acquireDate: number;
  key: string;
}

export enum PitChatOptions {
  "kill_feed",
  "prestige_announcements",
  "minor_events",
  "streaks",
  "player_chat",
  "bounties",
  "misc",
}

export interface PitProfile {
  //
  // All index types are here for use with iteration,
  // these are also all added as records to the actual type
  //

  /**
   * List of upgrades (perks, passives, and killstreaks) that the player unlocked at each prestige.
   * Each unlock contains a "tier" (set to 0 if the upgrade has no tier), Unix timestamp, and a key.
   * The player's first prestige is stored as unlocks, not unlocks_0.
   */
  [unlocksIndex: `unlocks${"" | `_${number}`}`]: PitUnlocks;

  /**
   * The player's selected perks.
   */
  [perk: `selected_perk_${number}`]: string;

  /**
   * The amount of gold the player obtained during a prestige.
   */
  [key: `cash_during_prestige_${number}`]: number;

  /**
   * The player's /pitchat settings.
   */
  [chatOption: `chat_option_${keyof typeof PitChatOptions}`]: boolean;

  /**
   * Unix timestamps of when the player last claimed various faction items and perks.
   */
  [
    genesisClaims: `genesis_weekly_perks_${
      | `perma_${"xp" | "gold"}`
      | `claim_item_${PitGenesisFactions}`}`
  ]: number;

  /**
   * The number of times the player has claimed the Tier VII reward of the respective faction.
   */
  [genesisPerma: `genesis_perma_${PitGenesisFactions}`]: number;

  /**
   * The player's selected killstreaks.
   */
  [killstreak: `selected_killstreak_${number}`]: string;
  [stackStreaks: `${"gold" | "xp"}_stack_streak_${number}`]: number;

  xp: number;
  cash: number;
  renown: number;

  /**
   * The current outgoing offers the player has,created with /offer. The objects, each corresponding to one use of the /offer command, contain several keys.
   */
  outgoing_offers: PitOutgoingOffer[];

  /**
   * The Unix timestamp of the player's most recent save of their API stats. Updates to the current
   * time approximately every three minutes when the player is in Pit. Does not update when it has
   * been more than three minutes since the player played Pit.
   */
  last_save: number;

  /**
   * Stats for the most recent King's Quest the player started.
   */
  king_quest: PitKingsQuest;

  /**
   * Unix timestamp of when the player last received participation XP.
   */
  last_passive_xp: number;

  /**
   * ???
   */
  trade_timestamps: [];

  /**
   * Byte array of the contents of the player's ender chest.
   */
  inv_enderchest: NBTData;

  /**
   * Byte arrays of the player's four most recent death recaps. Formatting codes are included in the array.
   */
  death_recaps: NBTData;

  /**
   * Whether the player has selected to spawn in their faction's base.
   */
  genesis_spawn_in_base: boolean;

  /**
   * The player's statistics for the in-game Pit leaderboards.
   */
  leaderboard_stats: Record<
    `Pit_${
      | "blockhead_blocks"
      | `tdm_${"red" | "blue"}_kills`
      | `kotl_${"time" | "gold"}`
      | "rage_pit_damage"
      | "kills_as_beast"
      | `raffle_${"tickets" | "jackpot"}`
      | "auction_bid"
      | "cake_eaten"}_20${IntRange<19, 24>}_${"fall" | "winter" | "summer" | "spring"}`,
    number
  >;

  /**
   * The player's currently in-progress contract.
   */
  contract: PitContract;

  /**
   * Unix timestamp of the player's last completed contract.
   */
  last_contract: number;

  /**
   * The player's most recently completed trades.
   */
  gold_transactions: {
    amount: number;
    timestamp: number;
  }[];

  /**
   * The player's most recently-chosen faction on the Genesis map.
   */
  genesis_allegiance: Uppercase<PitGenesisFactions>;

  /**
   * The player's inventory contents. Stored as a byte array.
   */
  inv_contents: NBTData;

  /**
   * Unix timestamps of when the player last purchased each item in the item shop.
   */
  items_last_buy: {
    "Pants Bundle": number;
    bounty_solvent: number;
    combat_spade: number;
    diamond_boots: number;
    diamond_chestplate: number;
    diamond_leggings: number;
    diamond_sword: number;
    first_aid_egg: number;
    golden_pickaxe: number;
    iron_pack: number;
    jump_boost_potion: number;
    new_golden_pickaxe: number;
    obsidian: number;
    obsidian_stack: number;
    tactical_insertion: number;
  };

  /**
   * Faction points earned on the most recent iteration of the Genesis map.
   */
  genesis_points: number;

  /**
   * Array of prestiges.
   */
  prestiges: PitPrestiges[];

  /**
   * Byte array of the player's Spire stash inventory, containing the player's items that will be given
   * back to them once the Spire event concludes.
   */
  spire_stash_inv: NBTData;

  /**
   * Byte array of the player's Spire stash armor, containing the player's armor that will be given
   * back to them once the Spire event concludes.
   */
  spire_stash_armor: NBTData;

  cheap_milk: false;

  /**
   * Whether the player has logged in at least once after March 19th, 2018, the date of The Pit 0.3's release.
   */
  zero_point_three_gold_transfer: boolean;

  /**
   * Contains several objects, each corresponding to a renown unlock.
   */
  renown_unlocks: PitRenownUnlocks[];

  /**
   * Unix timestamp of the last time the player disconnected while in combat.
   */
  last_midfight_disconnect: number;

  inv_armor: NBTData;

  item_stash: NBTData;

  /**
   * Unix timestamp of when the player last selected a faction to join.
   */
  genesis_allegiance_time: number;

  /**
   * ???
   */
  login_messages: any[];

  /**
   * Array of Minecraft Item IDs corresponding to inventory slots.
   * Slots represent the locations items respawn in when the player dies.
   */
  hotbar_favorites: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ];

  ended_contracts: PitContract[];

  /**
   * List of bounty bumps
   */
  bounties: PitBounty[];

  /**
   * Whether the player chooses to receive Night Quests.
   */
  night_quests_enabled: boolean;

  /**
   * The leaderboard that displays for the player in spawn.
   */
  selected_leaderboard: string;

  /**
   * The player's selected megastreak. Returns null if the megastreak is Overdrive.
   */
  selected_killstreak_0: string;

  /**
   * Whether the player is choosing to display their Pit Supporter star.
   */
  supporter_star_enabled: boolean;

  /**
   * Whether the player chose to disable the default sword and bow from their inventory when they spawn.
   */
  disable_spawn_items: boolean;

  shops_throttle: PitShopsThrottle;

  /**
   * Array of items that the player has Autobuy enabled on.
   */
  autobuy_items: string[];

  /**
   * List of the three contracts the player can select.
   * Returns null if the player has no contracts to select
   */
  contract_choices: [PitContract?, PitContract?, PitContract?] | null;

  /**
   * The player has in their Mystic Well.
   */
  mystic_well_item: NBTData;

  /**
   * The player's selected megastreak. If they have Uberstreak selected,
   * this key returns the player's previously-selected megastreak instead.
   */
  selected_megastreak_except_uber: string;

  /**
   * Unix timestamps of the player's recent Uberstreak completions.
   */
  recent_uberstreaks: number[];

  /**
   * Whether the player's Fancy Hat has an enchanted glint from Pit Supporter.
   */
  hat_glint_enabled: boolean;

  /**
   * Whether the player has the renown perk Apollo enabled.
   */
  apollo_enabled: boolean;

  /**
   * Array of events the player helped create in The Pit 0.4.
   * Events only appear if the player clicked the "Collect reward" button
   * in the Prestige NPC before The Pit 1.0.0.
   */
  event_contest_claims: string[];

  /**
   * The stats that the player has the /dropconfirm command in; true for the drop
   * confirm being disabled, and false for the drop confirm being enabled.
   */
  drop_confirm_disabled: boolean;

  /**
   * ???
   */
  zero_point_two_xp: number;

  /**
   * Whether the player has the Fancy Hat renown upgrade enabled.
   */
  hat_enabled: boolean;

  /**
   * Whether the player has the Impatient renown upgrade enabled.
   */
  impatient_enabled: boolean;

  /**
   * The player's selected launch trail from the renown shop.
   */
  selected_launch_trail: string;

  /**
   * Whether the player refunded 10 renown from the Golden Pickaxe being
   * removed from the renown shop in The Pit 1.0.5.
   */
  refunded_golden_pickaxe: boolean;

  /**
   * The item in the "sacrifice" slot of the Mystic Well.
   */
  mystic_well_pants: NBTData;

  /**
   * The Unix time of the player's last use of a Mark of Recon Essence.
   */
  reconessence_day: number;

  /**
   * The Unix time of when the player last wore dark pants
   * with the Lycanthropy enchantment.
   */
  last_lycanthropy: number;

  /**
   * ???
   */
  uber_paid_up: number;

  /**
   * The number of times the player has claimed the +1%
   * Mystic Drop Chance Uberdrop from an Uberstreak.
   */
  uberdrop_mystic_stacks: number;

  /**
   * Whether the player has the renown upgrade Raw Numbers enabled.
   */
  raw_numbers_enabled: boolean;

  /**
   * @Deprecated
   *
   * Used by admins to test the contracts feature.
   */
  contract_offers: any;
}

export type HypixelPitProfile = PitProfile &
  Record<`unlocks${"" | `_${IntRange<1, 51>}`}`, PitUnlocks> &
  Record<`selected_perk_${IntRange<0, 4>}`, string> &
  Record<`cash_during_prestige_${IntRange<0, 50>}`, number> &
  Record<`chat_option_${keyof typeof PitChatOptions}`, boolean> &
  Record<
    `genesis_weekly_perks_${
      | `perma_${"xp" | "gold"}`
      | `claim_item_${keyof typeof PitGenesisFactions}`}`,
    number
  > &
  Record<`genesis_perma_${keyof typeof PitGenesisFactions}`, number> &
  Record<`selected_killstreak_${IntRange<1, 5>}`, string> &
  Record<`${"gold" | "xp"}_stack_streak_${IntRange<0, 51>}`, number> &
  Record<`selected_killstreak_${IntRange<1, 5>}`, string>;

export interface HypixelPitStats extends BasicStats {
  packages?: ["supporter"];
  restored_inv_backup_1?: number;
  stats_move_1: number;
  pit_stats_ptl?: PitStatsPTL & unknown;
  profile?: HypixelPitProfile;
}
