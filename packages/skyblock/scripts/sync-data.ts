/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Pulls NEU-REPO at one commit and writes the parts @statsify/skyblock reads to src/generated/, plus
// textures-1.8.json from minecraft-data and the 1.8 pack in assets/public. Builds and the runtime never fetch these,
// so run it by hand and commit the output: node scripts/sync-data.ts <full commit sha>
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { KUUDRA_TIERS, type PlayerStat, type PowerStat, RARITIES, type StatValue } from "#types";
import { normalizeItemText, statNamed, statRewards } from "#lore";
import { add, roundTo } from "@statsify/math";
import { prettify, removeFormatting } from "@statsify/util";
import { skinHash } from "#textures";
import { tmpdir } from "node:os";
import { bestiaryBoards, collectionBoards } from "@statsify/skyblock";
import { toLevelCosts } from "#leveling";

const REPO = "NotEnoughUpdates/NotEnoughUpdates-REPO";
const HYPIXEL_SKILLS = "https://api.hypixel.net/v2/resources/skyblock/skills";
const HYPIXEL_COLLECTIONS = "https://api.hypixel.net/v2/resources/skyblock/collections";

const MINECRAFT_DATA = "PrismarineJS/minecraft-data";
const MINECRAFT_DATA_SHA = "15411f050f040e4c5df09352a75a9912ad8c3eeb"; // 3.117.0
const PACK = new URL("../../../assets/public/minecraft-textures/default/assets/minecraft/textures/", import.meta.url);

const COLORS = ["white", "orange", "magenta", "light_blue", "yellow", "lime", "pink", "gray", "silver", "cyan", "purple", "blue", "brown", "green", "red", "black"] as const;
const WOODS = ["oak", "spruce", "birch", "jungle", "acacia", "big_oak"] as const;
const blocks = (names: readonly string[], prefix = "") => names.map((name) => `blocks/${prefix}${name}`);

/**
 * 1.8 items whose icon isn't items/<name> or blocks/<name>, by minecraft-data name; a list is indexed by Damage. Blocks
 * draw flat, from the face their item shows most; chests, banners and skulls name the entity texture ./icons crops.
 */
const TEXTURES: Record<string, string | string[]> = {
  stone: blocks(["stone", "stone_granite", "stone_granite_smooth", "stone_diorite", "stone_diorite_smooth", "stone_andesite", "stone_andesite_smooth"]),
  grass: "blocks/grass_side",
  dirt: blocks(["dirt", "coarse_dirt", "dirt_podzol_side"]),
  planks: blocks(WOODS, "planks_"),
  sapling: blocks(["oak", "spruce", "birch", "jungle", "acacia", "roofed_oak"], "sapling_"),
  sand: blocks(["sand", "red_sand"]),
  log: blocks(WOODS, "log_"),
  leaves: blocks(WOODS.slice(0, 4), "leaves_"),
  sponge: blocks(["sponge", "sponge_wet"]),
  dispenser: "blocks/dispenser_front_horizontal",
  sandstone: blocks(["normal", "carved", "smooth"], "sandstone_"),
  golden_rail: "blocks/rail_golden",
  detector_rail: "blocks/rail_detector",
  sticky_piston: "blocks/piston_top_sticky",
  tallgrass: blocks(["deadbush", "tallgrass", "fern"]),
  piston: "blocks/piston_top_normal",
  wool: blocks(COLORS, "wool_colored_"),
  yellow_flower: "blocks/flower_dandelion",
  red_flower: blocks(["rose", "blue_orchid", "allium", "houstonia", "tulip_red", "tulip_orange", "tulip_white", "tulip_pink", "oxeye_daisy"], "flower_"),
  brown_mushroom: "blocks/mushroom_brown",
  red_mushroom: "blocks/mushroom_red",
  stone_slab: blocks(["stone_slab_side", "sandstone_normal", "planks_oak", "cobblestone", "brick", "stonebrick", "nether_brick", "quartz_block_side"]),
  brick_block: "blocks/brick",
  tnt: "blocks/tnt_side",
  mossy_cobblestone: "blocks/cobblestone_mossy",
  torch: "blocks/torch_on",
  mob_spawner: "blocks/spawner",
  oak_stairs: "blocks/planks_oak",
  chest: "entity/chest/normal",
  crafting_table: "blocks/crafting_table_front",
  farmland: "blocks/farmland_dry",
  furnace: "blocks/furnace_front_off",
  rail: "blocks/rail_normal",
  stone_stairs: "blocks/cobblestone",
  lever: "blocks/lever",
  stone_pressure_plate: "blocks/stone",
  wooden_pressure_plate: "blocks/planks_oak",
  redstone_torch: "blocks/redstone_torch_on",
  stone_button: "blocks/stone",
  snow_layer: "blocks/snow",
  cactus: "blocks/cactus_side",
  jukebox: "blocks/jukebox_side",
  fence: "blocks/planks_oak",
  pumpkin: "blocks/pumpkin_face_off",
  lit_pumpkin: "blocks/pumpkin_face_on",
  stained_glass: blocks(COLORS, "glass_"),
  monster_egg: blocks(["stone", "cobblestone", "stonebrick", "stonebrick_mossy", "stonebrick_cracked", "stonebrick_carved"]),
  stonebrick: blocks(["", "_mossy", "_cracked", "_carved"], "stonebrick"),
  brown_mushroom_block: "blocks/mushroom_block_skin_brown",
  red_mushroom_block: "blocks/mushroom_block_skin_red",
  glass_pane: "blocks/glass",
  melon_block: "blocks/melon_side",
  fence_gate: "blocks/planks_oak",
  brick_stairs: "blocks/brick",
  stone_brick_stairs: "blocks/stonebrick",
  mycelium: "blocks/mycelium_side",
  nether_brick: "blocks/nether_brick",
  nether_brick_fence: "blocks/nether_brick",
  nether_brick_stairs: "blocks/nether_brick",
  enchanting_table: "blocks/enchanting_table_side",
  end_portal_frame: "blocks/endframe_side",
  redstone_lamp: "blocks/redstone_lamp_off",
  wooden_slab: blocks(WOODS, "planks_"),
  sandstone_stairs: "blocks/sandstone_normal",
  ender_chest: "entity/chest/ender",
  spruce_stairs: "blocks/planks_spruce",
  birch_stairs: "blocks/planks_birch",
  jungle_stairs: "blocks/planks_jungle",
  cobblestone_wall: blocks(["cobblestone", "cobblestone_mossy"]),
  wooden_button: "blocks/planks_oak",
  anvil: blocks(["0", "1", "2"], "anvil_top_damaged_"),
  trapped_chest: "entity/chest/trapped",
  light_weighted_pressure_plate: "blocks/gold_block",
  heavy_weighted_pressure_plate: "blocks/iron_block",
  daylight_detector: "blocks/daylight_detector_top",
  quartz_block: blocks(["side", "chiseled", "lines"], "quartz_block_"),
  quartz_stairs: "blocks/quartz_block_side",
  activator_rail: "blocks/rail_activator",
  dropper: "blocks/dropper_front_horizontal",
  stained_hardened_clay: blocks(COLORS, "hardened_clay_stained_"),
  stained_glass_pane: blocks(COLORS, "glass_"),
  leaves2: blocks(["acacia", "big_oak"], "leaves_"),
  log2: blocks(["acacia", "big_oak"], "log_"),
  acacia_stairs: "blocks/planks_acacia",
  dark_oak_stairs: "blocks/planks_big_oak",
  prismarine: blocks(["rough", "bricks", "dark"], "prismarine_"),
  hay_block: "blocks/hay_block_side",
  carpet: blocks(COLORS, "wool_colored_"),
  packed_ice: "blocks/ice_packed",
  double_plant: blocks(["sunflower_front", "syringa_top", "grass_top", "fern_top", "rose_top", "paeonia_top"], "double_plant_"),
  red_sandstone: blocks(["normal", "carved", "smooth"], "red_sandstone_"),
  red_sandstone_stairs: "blocks/red_sandstone_normal",
  stone_slab2: "blocks/red_sandstone_normal",
  spruce_fence_gate: "blocks/planks_spruce",
  birch_fence_gate: "blocks/planks_birch",
  jungle_fence_gate: "blocks/planks_jungle",
  dark_oak_fence_gate: "blocks/planks_big_oak",
  acacia_fence_gate: "blocks/planks_acacia",
  spruce_fence: "blocks/planks_spruce",
  birch_fence: "blocks/planks_birch",
  jungle_fence: "blocks/planks_jungle",
  dark_oak_fence: "blocks/planks_big_oak",
  acacia_fence: "blocks/planks_acacia",
  wooden_sword: "items/wood_sword",
  wooden_shovel: "items/wood_shovel",
  wooden_pickaxe: "items/wood_pickaxe",
  wooden_axe: "items/wood_axe",
  wooden_hoe: "items/wood_hoe",
  golden_sword: "items/gold_sword",
  golden_shovel: "items/gold_shovel",
  golden_pickaxe: "items/gold_pickaxe",
  golden_axe: "items/gold_axe",
  golden_hoe: "items/gold_hoe",
  wheat_seeds: "items/seeds_wheat",
  golden_helmet: "items/gold_helmet",
  golden_chestplate: "items/gold_chestplate",
  golden_leggings: "items/gold_leggings",
  golden_boots: "items/gold_boots",
  porkchop: "items/porkchop_raw",
  cooked_porkchop: "items/porkchop_cooked",
  golden_apple: "items/apple_golden",
  wooden_door: "items/door_wood",
  bucket: "items/bucket_empty",
  water_bucket: "items/bucket_water",
  lava_bucket: "items/bucket_lava",
  minecart: "items/minecart_normal",
  iron_door: "items/door_iron",
  redstone: "items/redstone_dust",
  reeds: "items/sugar_cane",
  milk_bucket: "items/bucket_milk",
  book: "items/book_normal",
  slime_ball: "items/slimeball",
  chest_minecart: "items/minecart_chest",
  furnace_minecart: "items/minecart_furnace",
  compass: "items/compass_00",
  fishing_rod: "items/fishing_rod_uncast",
  clock: "items/clock_00",
  fish: ["items/fish_cod_raw", "items/fish_salmon_raw", "items/tropical_fish", "items/fish_pufferfish_raw"],
  cooked_fish: ["items/fish_cod_cooked", "items/fish_salmon_cooked"],
  // The pack has 1.14's red_dye and yellow_dye in place of 1.8's dye_powder_red and dye_powder_yellow.
  dye: COLORS.toReversed().map((color) => (color === "red" || color === "yellow" ? `items/${color}_dye` : `items/dye_powder_${color}`)),
  melon: "items/melon_slice",
  pumpkin_seeds: "items/seeds_pumpkin",
  melon_seeds: "items/seeds_melon",
  beef: "items/beef_raw",
  cooked_beef: "items/beef_cooked",
  chicken: "items/chicken_raw",
  cooked_chicken: "items/chicken_cooked",
  potion: "items/potion_bottle_drinkable",
  glass_bottle: "items/potion_bottle_empty",
  fermented_spider_eye: "items/spider_eye_fermented",
  speckled_melon: "items/melon_speckled",
  fire_charge: "items/fireball",
  baked_potato: "items/potato_baked",
  poisonous_potato: "items/potato_poisonous",
  map: "items/map_empty",
  golden_carrot: "items/carrot_golden",
  coal: ["items/coal", "items/charcoal"],
  skull: ["entity/skeleton/skeleton", "entity/skeleton/wither_skeleton", "entity/zombie/zombie", "entity/steve", "entity/creeper/creeper"],
  firework_charge: "items/fireworks_charge",
  enchanted_book: "items/book_enchanted",
  netherbrick: "items/nether_brick",
  tnt_minecart: "items/minecart_tnt",
  hopper_minecart: "items/minecart_hopper",
  rabbit: "items/rabbit_raw",
  cooked_rabbit: "items/rabbit_cooked",
  armor_stand: "items/wooden_armorstand",
  golden_horse_armor: "items/gold_horse_armor",
  command_block_minecart: "items/minecart_command_block",
  mutton: "items/mutton_raw",
  cooked_mutton: "items/mutton_cooked",
  banner: "entity/banner_base",
  spruce_door: "items/door_spruce",
  birch_door: "items/door_birch",
  jungle_door: "items/door_jungle",
  acacia_door: "items/door_acacia",
  dark_oak_door: "items/door_dark_oak",
};

/**
 * The items resource's material names that aren't minecraft-data's 1.8 name in capitals. Blocks and items are kept
 * apart because a few share a name (reeds is SUGAR_CANE_BLOCK as a block and SUGAR_CANE as an item).
 */
const MATERIAL_NAMES: Record<"blocks" | "items", Record<string, string>> = {
  blocks: {
    bed: "BED_BLOCK", birch_stairs: "BIRCH_WOOD_STAIRS", brick_block: "BRICK",
    brown_mushroom_block: "HUGE_MUSHROOM_1", cake: "CAKE_BLOCK", carrots: "CARROT", cobblestone_wall: "COBBLE_WALL",
    command_block: "COMMAND", crafting_table: "WORKBENCH", deadbush: "DEAD_BUSH", double_stone_slab: "DOUBLE_STEP",
    double_wooden_slab: "WOOD_DOUBLE_STEP", enchanting_table: "ENCHANTMENT_TABLE", end_portal: "ENDER_PORTAL",
    end_portal_frame: "ENDER_PORTAL_FRAME", end_stone: "ENDER_STONE", farmland: "SOIL", flowing_lava: "LAVA",
    flowing_water: "WATER", glass_pane: "THIN_GLASS", golden_rail: "POWERED_RAIL", hardened_clay: "HARD_CLAY",
    heavy_weighted_pressure_plate: "IRON_PLATE", iron_bars: "IRON_FENCE", iron_door: "IRON_DOOR_BLOCK",
    jungle_stairs: "JUNGLE_WOOD_STAIRS", lava: "STATIONARY_LAVA", leaves2: "LEAVES_2",
    light_weighted_pressure_plate: "GOLD_PLATE", lit_furnace: "BURNING_FURNACE", lit_pumpkin: "JACK_O_LANTERN",
    lit_redstone_lamp: "REDSTONE_LAMP_ON", lit_redstone_ore: "GLOWING_REDSTONE_ORE", log2: "LOG_2",
    monster_egg: "MONSTER_EGGS", mycelium: "MYCEL", nether_brick_fence: "NETHER_FENCE", nether_wart: "NETHER_WARTS",
    noteblock: "NOTE_BLOCK", oak_stairs: "WOOD_STAIRS", piston: "PISTON_BASE",
    piston_extension: "PISTON_MOVING_PIECE", piston_head: "PISTON_EXTENSION", planks: "WOOD", potatoes: "POTATO",
    powered_comparator: "REDSTONE_COMPARATOR_ON", powered_repeater: "DIODE_BLOCK_ON", rail: "RAILS",
    red_flower: "RED_ROSE", red_mushroom_block: "HUGE_MUSHROOM_2", redstone_lamp: "REDSTONE_LAMP_OFF",
    redstone_torch: "REDSTONE_TORCH_ON", reeds: "SUGAR_CANE_BLOCK", slime: "SLIME_BLOCK", snow: "SNOW_BLOCK",
    snow_layer: "SNOW", spruce_stairs: "SPRUCE_WOOD_STAIRS", stained_hardened_clay: "STAINED_CLAY",
    standing_sign: "SIGN_POST", sticky_piston: "PISTON_STICKY_BASE", stone_brick_stairs: "SMOOTH_STAIRS",
    stone_pressure_plate: "STONE_PLATE", stone_slab: "STEP", stone_stairs: "COBBLESTONE_STAIRS",
    stonebrick: "SMOOTH_BRICK", tallgrass: "LONG_GRASS", trapdoor: "TRAP_DOOR",
    unlit_redstone_torch: "REDSTONE_TORCH_OFF", unpowered_comparator: "REDSTONE_COMPARATOR_OFF",
    unpowered_repeater: "DIODE_BLOCK_OFF", water: "STATIONARY_WATER", waterlily: "WATER_LILY", wheat: "CROPS",
    wooden_button: "WOOD_BUTTON", wooden_pressure_plate: "WOOD_PLATE", wooden_slab: "WOOD_STEP",
  },
  items: {
    acacia_door: "ACACIA_DOOR_ITEM", beef: "RAW_BEEF", birch_door: "BIRCH_DOOR_ITEM",
    brewing_stand: "BREWING_STAND_ITEM", brick: "CLAY_BRICK", carrot: "CARROT_ITEM",
    carrot_on_a_stick: "CARROT_STICK", cauldron: "CAULDRON_ITEM", chest_minecart: "STORAGE_MINECART",
    chicken: "RAW_CHICKEN", clock: "WATCH", command_block_minecart: "COMMAND_MINECART",
    comparator: "REDSTONE_COMPARATOR", cooked_porkchop: "GRILLED_PORK", dark_oak_door: "DARK_OAK_DOOR_ITEM",
    diamond_horse_armor: "DIAMOND_BARDING", diamond_shovel: "DIAMOND_SPADE", dye: "INK_SACK",
    ender_eye: "EYE_OF_ENDER", experience_bottle: "EXP_BOTTLE", filled_map: "MAP", fire_charge: "FIREBALL",
    fireworks: "FIREWORK", fish: "RAW_FISH", flower_pot: "FLOWER_POT_ITEM", furnace_minecart: "POWERED_MINECART",
    golden_axe: "GOLD_AXE", golden_boots: "GOLD_BOOTS", golden_chestplate: "GOLD_CHESTPLATE",
    golden_helmet: "GOLD_HELMET", golden_hoe: "GOLD_HOE", golden_horse_armor: "GOLD_BARDING",
    golden_leggings: "GOLD_LEGGINGS", golden_pickaxe: "GOLD_PICKAXE", golden_shovel: "GOLD_SPADE",
    golden_sword: "GOLD_SWORD", gunpowder: "SULPHUR", iron_horse_armor: "IRON_BARDING", iron_shovel: "IRON_SPADE",
    jungle_door: "JUNGLE_DOOR_ITEM", lead: "LEASH", map: "EMPTY_MAP", mushroom_stew: "MUSHROOM_SOUP",
    nether_wart: "NETHER_STALK", netherbrick: "NETHER_BRICK_ITEM", porkchop: "PORK", potato: "POTATO_ITEM",
    record_13: "GOLD_RECORD", record_blocks: "RECORD_3", record_cat: "GREEN_RECORD", record_chirp: "RECORD_4",
    record_far: "RECORD_5", record_mall: "RECORD_6", record_mellohi: "RECORD_7", record_stal: "RECORD_8",
    record_strad: "RECORD_9", record_wait: "RECORD_12", record_ward: "RECORD_10", reeds: "SUGAR_CANE",
    repeater: "DIODE", skull: "SKULL_ITEM", snowball: "SNOW_BALL", spawn_egg: "MONSTER_EGG",
    spruce_door: "SPRUCE_DOOR_ITEM", stone_shovel: "STONE_SPADE", tnt_minecart: "EXPLOSIVE_MINECART",
    wheat_seeds: "SEEDS", wooden_axe: "WOOD_AXE", wooden_door: "WOOD_DOOR", wooden_hoe: "WOOD_HOE",
    wooden_pickaxe: "WOOD_PICKAXE", wooden_shovel: "WOOD_SPADE", wooden_sword: "WOOD_SWORD",
    writable_book: "BOOK_AND_QUILL",
  },
};

interface MinecraftItem {
  id: number;
  name: string;
  variations?: { metadata: number }[];
}

const inPack = (path: string) => existsSync(new URL(`${path}.png`, PACK));

const texturePath = (name: string, damage: number) => {
  const rule = TEXTURES[name];
  const path = Array.isArray(rule) ? rule[damage] : (rule ?? [`items/${name}`, `blocks/${name}`].find(inPack));
  return path && inPack(path) ? path : undefined;
};

const sha = process.argv[2] ?? "";
if (!/^[\da-f]{40}$/.test(sha)) throw new Error("usage: node scripts/sync-data.ts <full commit sha>");

const out = new URL("../src/generated/", import.meta.url);
const dir = await mkdtemp(join(tmpdir(), "neu-repo-"));

interface HypixelSkill {
  maxLevel: number;
  levels: { totalExpRequired: number; unlocks?: string[] }[];
}

interface HypixelCollections {
  name: string;
  items: Record<string, { name: string; tiers: { amountRequired: number }[] }>;
}

/** One of Hypixel's keyless SkyBlock resources. */
async function hypixelResource<T>(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return (await response.json()) as T & { version: string };
}

/** Stat values summed by stat, rounded off the float noise of running totals, zeros left out. */
const statTotals = (values: StatValue[]) => {
  const totals: Partial<Record<PlayerStat, number>> = {};
  for (const { stat, value } of values) totals[stat] = add(totals[stat] ?? 0, value);
  return Object.fromEntries(
    Object.entries(totals).flatMap(([stat, value]) => (value === 0 ? [] : [[stat, roundTo(value, 4)]]))
  );
};

/** NEU's stat ids (crit_damage, BONUS_ATTACK_SPEED) as stats; ids that aren't a player stat (damage) are left out. */
const neuStats = (stats: Record<string, number>) =>
  statTotals(
    Object.entries(stats).flatMap(([id, value]) => {
      const stat = statNamed(prettify(id));
      return stat ? [{ stat, value }] : [];
    })
  );

/**
 * A perk's stats, when its lore grants them outright ("Grants +{stat} ⸕ Mining Speed.", "Increase ∮ Sweep by {stat}.",
 * "You gain {stat} Pressure Resistance."), as the value its NEU expression gives at each level, or a one-level perk's
 * fixed amounts ("Increase Sweep by 10 and Foraging Fortune by 50."). Perks that grant one "when mining Gemstones" or
 * "for the first 250 trees cut every day" don't count on the stat sheet.
 */
function perkStats({ lore = [], stat: expression, maxLevel }: { lore?: unknown[]; stat?: string; maxLevel: number }) {
  const text = removeFormatting(normalizeItemText(lore.filter((line) => typeof line === "string").join(" ")))
    .replaceAll(/[^\w{}+.' ]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();

  const fixed = /^Increase (.+) by ([\d.]+) and (.+) by ([\d.]+)\.$/.exec(text);
  if (fixed) {
    const stats = [
      [fixed[1], fixed[2]],
      [fixed[3], fixed[4]],
    ].flatMap(([name, value]) => {
      const id = statNamed(name);
      return id ? [{ id, base: Number(value), perLevel: 0 }] : [];
    });
    return stats.length > 0 ? stats : undefined;
  }

  const name =
    /^Grants \+?\{stats?\} (.+)\.$/.exec(text)?.[1] ??
    /^Increase (.+) by \{stat\}\.$/.exec(text)?.[1] ??
    /^You gain \{stat\} (.+)\.$/.exec(text)?.[1];
  const id = name && statNamed(name);
  if (!id || !expression) return undefined;

  const at = (level: number) => evaluate(expression, level);
  const perLevel = roundTo(at(2) - at(1), 6);
  const base = roundTo(at(1) - perLevel, 6);
  if (Math.abs(base + perLevel * maxLevel - at(maxLevel)) > 1e-6) throw new Error(`${expression} isn't linear in level`);
  return [{ id, base, perLevel }];
}

/** One of NEU's perk stat expressions, "(round-decimals (+ 5 (* level 0.1)) 1)", at a level. */
function evaluate(expression: string, level: number): number {
  const tokens = expression.replaceAll("(", " ( ").replaceAll(")", " ) ").trim().split(/\s+/);
  const read = (): unknown => {
    const token = tokens.shift()!;
    if (token !== "(") return token;
    const list: unknown[] = [];
    while (tokens[0] !== ")") list.push(read());
    tokens.shift();
    return list;
  };

  const run = (node: unknown): number => {
    if (!Array.isArray(node)) return node === "level" ? level : Number(node);
    const [op, ...args] = node;
    const [a, b] = args.map(run);
    if (op === "+") return a + b;
    if (op === "*") return a * b;
    if (op === "id") return a;
    if (op === "round-decimals") return roundTo(a, b);
    throw new Error(`unknown perk expression ${op}`);
  };

  return run(read());
}

/**
 * A pet item's effect, from the lore NEU keeps: flat stats ("Grants +30❁ Strength and +20✦ Speed."), a pet stat raised
 * by a percent ("Increases the pet's ☠ Crit Damage by 50%"), or every pet stat ("Increases all pet stats by 33.3%").
 * Sentences with a condition ("while mining Titanium Ore", "for each of your Garden Levels") are left out.
 */
function petItemEffect(lore: string[]) {
  const text = removeFormatting(lore.map(normalizeItemText).join(" ")).replaceAll(/\s+/g, " ");
  const sentences = text.split(/(?<=[.!]) /);

  const flat = sentences
    .filter((sentence) => sentence.startsWith("Grants ") && !/\b(?:when|while|for each|for every|per)\b/.test(sentence))
    .flatMap((sentence) => {
      const reduced = [...sentence.matchAll(/reduces your \W*([A-Z][\w ]+?) by ([\d.]+)/g)].flatMap(([, name, value]) => {
        const stat = statNamed(name);
        return stat ? [{ stat, value: -Number(value) }] : [];
      });
      return [...statRewards(sentence), ...reduced];
    });

  const raised = sentences.flatMap((sentence) => {
    const list = /^Increases (?:the|this) pet's (.+)\.$/.exec(sentence)?.[1] ?? "";
    return [...list.matchAll(/\W*([A-Z][\w ]+?) by ([\d.]+)%/g)].flatMap(([, name, value]) => {
      const stat = statNamed(name);
      return stat ? [{ stat, value: Number(value) }] : [];
    });
  });

  const everyStat = /Increases all pet stats by ([\d.]+)%/.exec(text)?.[1];

  const effect = {
    stats: flat.length > 0 ? statTotals(flat) : undefined,
    petStats: raised.length > 0 ? statTotals(raised) : undefined,
    allPetStats: everyStat ? Number(everyStat) : undefined,
  };
  return effect.stats || effect.petStats || effect.allPetStats ? effect : undefined;
}

interface NeuItem {
  internalname: string;
  displayname: string;
  lore?: string[];
  nbttag: string;
}

/**
 * An attribute's level I stats, when its shard's lore grants them outright: "Magic Find I", then "Grants +0.5 Magic
 * Find.". The sentence can wrap and list stats, one amount covering the stats after it ("+1 ☘ Mining Fortune, ☘
 * Farming Fortune, and ☘ Foraging Fortune."), and a "which" clause only describes the stat. A grant against some mobs,
 * on some islands, while something holds or by a percent says more, so it gives none.
 */
function attributeGrants(lore: string[]) {
  const lines = lore.slice(1).map((line) => removeFormatting(normalizeItemText(line)).trim());
  const sentence = lines.slice(0, lines.findIndex((line) => line.endsWith(".")) + 1).join(" ").replaceAll(/\s+/g, " ");
  const terms = /^Grants (.+?)(?: which [^.]+)?\.$/.exec(sentence)?.[1].split(/,? and |, /) ?? [];

  let value: number | undefined;
  const grants = terms.map((term) => {
    const [, amount, name] = /^(?:([+-][\d,.]+)[^\s\w%]? )?(?:[^\s\w] )?([A-Z][\w']*(?: [A-Z][\w']*)*)$/.exec(term) ?? [];
    if (amount) value = Number(amount.replaceAll(",", ""));
    const stat = name && statNamed(name);
    return stat && value !== undefined ? { stat, value } : undefined;
  });

  return grants.length > 0 && grants.every(Boolean) ? grants : undefined;
}

const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(dir, path), "utf8")) as T;

/** Sorts object keys at every depth, so a resync only diffs real changes. */
const sorted = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sorted);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, sorted(child)])
  );
};

const write = (file: string, data: unknown) =>
  writeFile(new URL(file, out), `${JSON.stringify(sorted(data), null, 2)}\n`);

const boards = (list: { key: string; name: string }[]) => list.map(({ key, name }) => [key, name]);

/** The texture hash in an item's SkullOwner, from its SNBT. */
const skullHash = (nbt: string) => {
  const value = /Value:"([\w+/=]+)"/.exec(nbt)?.[1];
  return value && skinHash(value);
};

try {
  const response = await fetch(`https://codeload.github.com/${REPO}/tar.gz/${sha}`);
  if (!response.ok) throw new Error(`codeload answered ${response.status}`);
  await writeFile(join(dir, "repo.tar.gz"), Buffer.from(await response.arrayBuffer()));
  execFileSync("tar", ["-xzf", "repo.tar.gz", "--strip-components=1"], { cwd: dir });

  // Skill tables come from Hypixel's skills resource (keyless), since NEU's runecrafting table is off at five levels.
  const { skills, version: skillsVersion } = await hypixelResource<{ skills: Record<string, HypixelSkill> }>(HYPIXEL_SKILLS);
  const xpTable = (skill: string) => toLevelCosts(skills[skill].levels.map(({ totalExpRequired }) => totalExpRequired));

  // Collection tiers come from Hypixel's collections resource too, in its order of categories and items.
  const { collections, version: collectionsVersion } = await hypixelResource<{
    collections: Record<string, HypixelCollections>;
  }>(HYPIXEL_COLLECTIONS);
  const collectionData = Object.entries(collections).map(([category, { name, items }]) => ({
    id: category,
    name,
    items: Object.entries(items).map(([id, item]) => ({
      id,
      name: item.name,
      tiers: item.tiers.map(({ amountRequired }) => amountRequired),
    })),
  }));
  await write("collections.json", collectionData);

  const leveling = await readJson<Record<string, unknown>>("constants/leveling.json");
  const slayerXp = leveling.slayer_xp as Record<string, number[]>;
  const sblevels = await readJson<{ sblevel_colours: Record<string, string>; core_task: Record<string, unknown> }>(
    "constants/sblevels.json"
  );
  const fairySouls = await readJson<{ "Max Souls": number }>("constants/fairy_souls.json");
  await write("leveling.json", {
    catacombs: leveling.catacombs,
    fairy_souls: fairySouls["Max Souls"],
    HOTF: leveling.HOTF,
    HOTM: leveling.HOTM,
    leveling_caps: leveling.leveling_caps,
    leveling_xp: xpTable("COMBAT"),
    max_levels: Object.fromEntries(Object.entries(skills).map(([id, { maxLevel }]) => [id.toLowerCase(), maxLevel])),
    runecrafting_xp: xpTable("RUNECRAFTING"),
    sblevel_colours: sblevels.sblevel_colours,
    // NEU copies Revenant's 15 XP for Tarantula level 2; the game asks 25.
    slayer_xp: { ...slayerXp, spider: slayerXp.spider.with(1, 25) },
    slayer_to_highest_tier: leveling.slayer_to_highest_tier,
    social: xpTable("SOCIAL"),
  });

  await write("sblevels.json", {
    core_task: {
      accessory_bag_xp: sblevels.core_task.accessory_bag_xp,
      pet_score_xp: sblevels.core_task.pet_score_xp,
    },
  });

  type NeuPerk = { name: string; x: number; y: number; maxLevel: number; stat?: string; lore?: unknown[] };
  const layout = (perks: Record<string, NeuPerk>) =>
    Object.fromEntries(
      Object.entries(perks).map(([id, perk]) => [
        id,
        { name: perk.name, x: perk.x, y: perk.y, maxLevel: perk.maxLevel, stats: perkStats(perk) },
      ])
    );

  const hotm = await readJson<{ hotm: { perks: Record<string, NeuPerk> } }>("constants/hotmlayout.json");
  await write("hotmlayout.json", layout(hotm.hotm.perks));

  const hotf = await readJson<{ hotf: { perks: Record<string, NeuPerk> } }>("constants/hotflayout.json");
  await write("hotflayout.json", layout(hotf.hotf.perks));

  const { hoppity } = await readJson<{ hoppity: { rarities: Record<string, { rabbits: string[] }> } }>("constants/hoppity.json");
  await write("hoppity.json", Object.fromEntries(Object.entries(hoppity.rarities).map(([rarity, { rabbits }]) => [rarity, rabbits])));

  // Every bestiary page in NEU's order, the Fishing and Critter Safari pages' subpages under their category. A family
  // counts the kills of its mob ids up to its cap, and its tiers are its bracket's kills; critters have their own brackets.
  type NeuFamily = { name: string; mobs: string[]; cap: number; bracket: number; bracketType?: string };
  type NeuPage = { name: string; mobs?: NeuFamily[]; hasSubcategories?: boolean; [subpage: string]: unknown };
  const { brackets, bracketSets, ...islands } = await readJson<
    { brackets: Record<string, number[]>; bracketSets: Record<string, Record<string, number[]>> } & Record<string, NeuPage>
  >("constants/bestiary.json");
  const allBrackets: Record<string, number[]> = {
    ...brackets,
    ...Object.fromEntries(
      Object.entries(bracketSets).flatMap(([set, tiers]) => Object.entries(tiers).map(([n, kills]) => [`${set}_${n}`, kills]))
    ),
  };
  // NEU gives a few families (Parched, Lotusfish, some critters) a bracket that never reaches their cap. The game ranks
  // them on the critter bracket that ends at it (the wiki's tiers for three of them; unverified for the rest).
  const bracketOf = (name: string, cap: number, given: string) => {
    if (allBrackets[given].includes(cap)) return given;
    const ending = Object.keys(allBrackets).filter((key) => key.startsWith("CRITTERS_") && allBrackets[key].at(-1) === cap);
    if (ending.length !== 1) throw new Error(`bestiary: ${name}'s cap ${cap} isn't a step of ${given} or the end of one critter bracket`);
    return ending[0];
  };
  // Kill ids NEU's families leave out, each seen in the saves: older level variants, the Special Zealot and the Slimey
  // Rain Slime (each mob's page on the wiki, an owner exception, unverified)
  const missingIds: Record<string, string[]> = {
    "Cretan Bull": ["cretan_bull_40", "cretan_bull_70", "cretan_bull_95"],
    "Emerald Slime": ["emerald_slime_15"],
    "Minos Hunter": ["minos_hunter_25", "minos_hunter_80"],
    "Rain Slime": ["slimey_slime_50"],
    "Siamese Lynx": ["siamese_lynx_55"],
    "Stranded Nymph": ["stranded_nymph_40", "stranded_nymph_70", "stranded_nymph_95"],
    Zealot: ["zealot_special_enderman_55"],
  };
  const families = ({ mobs = [] }: NeuPage) =>
    mobs.map(({ name, mobs: ids, cap, bracket, bracketType }) => ({
      name: removeFormatting(name),
      ids: [...ids, ...(missingIds[removeFormatting(name)] ?? [])],
      cap,
      bracket: bracketOf(removeFormatting(name), cap, bracketType ? `${bracketType}_${bracket}` : String(bracket)),
    }));
  const subpages = (page: NeuPage) =>
    Object.values(page).filter((value: unknown): value is NeuPage => typeof value === "object" && value !== null && "mobs" in value);
  const bestiaryData = {
    brackets: allBrackets,
    pages: Object.values(islands).flatMap((page) =>
      page.hasSubcategories
        ? subpages(page).map((sub) => ({ category: page.name, name: sub.name, families: families(sub) }))
        : [{ name: page.name, families: families(page) }]
    ),
  };
  await write("bestiary.json", bestiaryData);

  // Hunting's shards and the attributes they level: shards.owned keys a shard by its bazaar name, attributes.stacks an
  // attribute by its internal name, and each level costs its rarity's next count of shards.
  const shards = await readJson<{
    attribute_levelling: Record<string, number[]>;
    unconsumable_attributes: string[];
    attributes: {
      bazaarName: string;
      displayName: string;
      rarity: string;
      internalName: string;
      abilityName: string;
      family?: string[];
    }[];
  }>("constants/attribute_shards.json");
  // Where NEU is stale: three attributes renamed, the families since 2026-08-24, which dropped Elusive, and Rainbug's
  // empty bazaar name, whose shard id is its name (the wiki's Shards table, an owner exception, unverified)
  const attributeNames: Record<string, string> = { almighty: "Almighty", pretty_clothes: "Pretty Clothes", visitor_bait: "Visitor Bait" };
  const shardFamilies: Record<string, string[]> = {
    CHOCOBUN: ["Crime"],
    GOLDOLOT: ["Amphibian", "Axolotl"],
    PACKRAT_SKULL: ["Cave Dweller"],
    QUEEN_SNAKE: ["Reptile", "Scaled", "Serpent"],
    SEA_SERPENT: ["Amphibian", "Eel", "Serpent"],
    SEPIALOT: ["Amphibian", "Axolotl"],
    TITANOBOA: ["Reptile", "Scaled", "Serpent"],
    WATER_SNAKE: ["Reptile", "Scaled", "Serpent"],
    WOODLOUSE: ["Bug", "Crustacean", "Trash Lover"],
  };
  await write("attribute-shards.json", {
    levels: shards.attribute_levelling,
    shards: await Promise.all(
      shards.attributes.map(async ({ bazaarName, displayName, rarity, internalName, abilityName, family = [] }) => {
        const { lore = [] } = await readJson<NeuItem>(join("items", `${internalName}.json`));
        const id = bazaarName ? bazaarName.replace(/^SHARD_/, "") : displayName.toUpperCase();
        const attribute = /^ATTRIBUTE_SHARD_(\w+);\d+$/.exec(internalName)![1].toLowerCase();
        const families = shardFamilies[id] ?? family.filter((name) => name !== "Elusive");
        return {
          id,
          name: displayName,
          attribute,
          attributeName: attributeNames[attribute] ?? abilityName,
          rarity,
          grants: attributeGrants(lore),
          ...(families.length > 0 && { families }),
          ...(shards.unconsumable_attributes.includes(bazaarName) && { unconsumable: true }),
        };
      })
    ),
  });

  // player_data.perks, which keeps the levels bought, calls NEU's eagle_advantage eagles_advantage
  const perkIds: Record<string, string> = { eagle_advantage: "eagles_advantage" };
  const shops = await readJson<Record<string, Record<string, { costs: number[] }>>>("constants/essenceshops.json");
  await write(
    "essenceshops.json",
    Object.fromEntries([
      ...Object.entries(shops).map(([shop, perks]) => [
        shop.replace("ESSENCE_", ""),
        Object.fromEntries(Object.entries(perks).map(([id, { costs }]) => [perkIds[id] ?? id, costs.length])),
      ]),
      // NEU has no Sun Gecko shop, the Rift's: Blessing of Time's 3 tiers (the wiki's Sun Gecko essence shop page, an
      // owner exception, unverified)
      ["SUN_GECKO", { blessing_of_time: 3 }],
    ])
  );

  // The Garden response keys crops by their collection ids; NEU keys the milestones by crop name
  const gardenCrops: Record<string, string> = {
    CARROT: "CARROT_ITEM",
    COCOA_BEANS: "INK_SACK:3",
    MUSHROOM: "MUSHROOM_COLLECTION",
    NETHER_WART: "NETHER_STALK",
    POTATO: "POTATO_ITEM",
    SUNFLOWER: "DOUBLE_PLANT",
  };
  const garden = await readJson<{
    garden_exp: number[];
    crop_milestones: Record<string, number[]>;
    visitors: Record<string, string>;
    plots: Record<string, unknown>;
    crop_upgrades: number[];
    composter_upgrades: Record<string, Record<string, unknown>>;
  }>("constants/garden.json");
  await write("garden.json", {
    garden_exp: garden.garden_exp,
    crop_milestones: Object.fromEntries(
      Object.entries(garden.crop_milestones).map(([crop, tiers]) => [gardenCrops[crop] ?? crop, tiers])
    ),
    visitors: garden.visitors,
    plots: Object.keys(garden.plots).toSorted(),
    crop_upgrades: garden.crop_upgrades.length,
    composter_upgrades: Object.fromEntries(
      Object.entries(garden.composter_upgrades).map(([id, levels]) => [id, Object.keys(levels).length])
    ),
  });

  // Accessory id → its tier's rank, and NEU's per-variant ids (an Abicase model, a party hat color) → the API's one id.
  const accessoryRanks = new Map<string, number>();
  const apiIds = new Map<string, string>();
  const petTextures: Record<string, Record<string, string>> = {};
  const petNames: Record<string, string> = {};
  const skinTextures: Record<string, string> = {};
  const powers: Record<string, { accessoryPower: number; stats: PowerStat[]; bonus: PowerStat[] }> = {};
  const kuudraKeys: Record<string, string> = {};
  const trophyFish = new Set(Object.keys(await readJson<Record<string, number[]>>("constants/trophyfish.json")));
  const trophyNames: Record<string, string> = {};
  const petItems: Record<string, NonNullable<ReturnType<typeof petItemEffect>>> = {};
  const files = (await readdir(join(dir, "items"))).filter((file) => file.endsWith(".json"));
  const items = await Promise.all(files.map((file) => readJson<NeuItem>(join("items", file))));

  for (const item of items) {
    // Pets are "<TYPE>;<tier>" with a petInfo tag, the tier indexing RARITIES (Phoenix only comes as SPECIAL and
    // VERY_SPECIAL); skins are PET_SKIN_<SKIN>
    const pet = item.nbttag.includes("petInfo") ? /^(.+);(\d)$/.exec(item.internalname) : null;
    const hash = pet && skullHash(item.nbttag);
    if (pet && hash) (petTextures[pet[1]] ??= {})[RARITIES[Number(pet[2])]] = hash;
    // "§7[Lvl {LVL}] §6Bee"; only the names prettify gets wrong (FRACTURED_MONTEZUMA_SOUL is Montezuma)
    if (pet) {
      const name = removeFormatting(item.displayname).replace(/^\[Lvl [^\]]+\] /, "");
      if (name !== prettify(pet[1])) petNames[pet[1]] ??= name;
    }

    // Kuudra's keys, KUUDRA_TIER_KEY for the basic tier the API calls "none" and KUUDRA_<TIER>_TIER_KEY for the rest
    const kuudraKey = /^KUUDRA_(?:(\w+)_)?TIER_KEY$/.exec(item.internalname);
    const keyHash = kuudraKey && skullHash(item.nbttag);
    if (kuudraKey && keyHash) kuudraKeys[kuudraKey[1]?.toLowerCase() ?? "none"] = keyHash;

    // Trophy fish are <FISH>_<TIER>, named "§fSulphur Skitter §8§lBRONZE"
    const trophy = /^(\w+)_BRONZE$/.exec(item.internalname);
    if (trophy && trophyFish.has(trophy[1])) trophyNames[trophy[1]] = removeFormatting(item.displayname).replace(/ BRONZE$/, "");

    const skin = item.internalname.startsWith("PET_SKIN_") && skullHash(item.nbttag);
    if (skin) skinTextures[item.internalname.slice("PET_SKIN_".length)] = skin;

    // "§a§lUNCOMMON PET ITEM"
    const petItem = removeFormatting(item.lore?.at(-1) ?? "").endsWith("PET ITEM") && petItemEffect(item.lore ?? []);
    if (petItem) petItems[item.internalname] = petItem;

    // A power stone lists its Power's stats, some negative, at a set Accessory Power: "§7At §6250 Accessory Power§7:",
    // then lines like "§c+80.99<glyph> Strength". Most then list a "Unique Power Bonus:", which doesn't scale.
    const lore = item.lore ?? [];
    const unlocks = /unlock the (.+?) power\./.exec(lore.map(removeFormatting).join(" "))?.[1];
    const statsAt = lore.findIndex((line) => /^At \d+ Accessory Power:$/.test(removeFormatting(line)));
    const bonusAt = lore.findIndex((line) => removeFormatting(line) === "Unique Power Bonus:");
    const statsFrom = (at: number) =>
      lore.slice(at + 1, lore.indexOf("", at)).map((line) => {
        const [, color, value, name] = /^(§.)([+-][\d.]+)\S* (.+)$/.exec(line)!;
        return { name, color, value: Number(value) };
      });
    if (unlocks && statsAt !== -1) {
      powers[unlocks.toLowerCase().replaceAll(" ", "_")] = {
        accessoryPower: Number(/\d+/.exec(removeFormatting(lore[statsAt]))![0]),
        stats: statsFrom(statsAt),
        bonus: bonusAt === -1 ? [] : statsFrom(bonusAt),
      };
    }

    // "§6§lLEGENDARY ACCESSORY", "§9§lRARE DUNGEON ACCESSORY", "§5§lEPIC HATCESSORY"
    const kind = /^(.+?)(?: DUNGEON)? (?:ACCESSORY|HATCESSORY)$/.exec(removeFormatting(item.lore?.at(-1) ?? "").trim());
    if (!kind) continue;

    accessoryRanks.set(item.internalname, RARITIES.findIndex((rarity) => rarity === kind[1].replaceAll(" ", "_")));
    const variant = /(?:model|party_hat_color|party_hat_emoji):"([^"]+)"/.exec(item.nbttag)?.[1];
    if (variant) apiIds.set(item.internalname, item.internalname.replace(`_${variant.toUpperCase()}`, ""));
  }

  await write("pet-textures.json", { pets: petTextures, skins: skinTextures });
  await write("powers.json", powers);
  const keyless = KUUDRA_TIERS.filter((tier) => !kuudraKeys[tier]);
  if (keyless.length > 0) throw new Error(`no Kuudra key head for ${keyless.join(", ")}`);
  await write("kuudra-keys.json", kuudraKeys);
  await write("trophyfish.json", trophyNames);
  await write("pet-items.json", petItems);

  const pets = await readJson<Record<string, unknown>>("constants/pets.json");
  const offsets = pets.pet_rarity_offset as Record<string, number>;
  await write("pets.json", {
    custom_pet_leveling: pets.custom_pet_leveling,
    id_to_display_name: { ...petNames, ...(pets.id_to_display_name as Record<string, string>) },
    pet_levels: pets.pet_levels,
    // NEU levels SPECIAL pets on Epic's table; the game uses Legendary's.
    pet_rarity_offset: { ...offsets, SPECIAL: offsets.LEGENDARY },
  });

  const api = (id: string) => apiIds.get(id) ?? id;
  const upgrades = new Map<string, Set<string>>();
  const supersede = (id: string, by: string) => {
    // NEU lists a few lower tiers as upgrades (Powder of the Many for Powder of the People); an upgrade is never lower.
    if (api(id) === api(by) || accessoryRanks.get(by)! < accessoryRanks.get(id)!) return;
    upgrades.set(api(id), (upgrades.get(api(id)) ?? new Set()).add(api(by)));
  };

  const misc = await readJson<{
    base_stats: Record<string, number>;
    ignored_talisman: string[];
    talisman_upgrades: Record<string, string[]>;
  }>("constants/misc.json");
  for (const [id, list] of Object.entries(misc.talisman_upgrades)) for (const by of list) supersede(id, by);

  // talisman_upgrades misses some steps (Pesthunter Artifact to Relic): in a family, each tier also gives way to every higher one.
  const parents = await readJson<Record<string, string[]>>("constants/parents.json");
  for (const [parent, children] of Object.entries(parents)) {
    const family = [parent, ...children].filter((id) => accessoryRanks.has(id));
    for (const id of family) {
      for (const by of family) if (accessoryRanks.get(by)! > accessoryRanks.get(id)!) supersede(id, by);
    }
  }

  await write("accessories.json", {
    ignored: [...new Set(misc.ignored_talisman.map(api))].toSorted(),
    upgrades: Object.fromEntries([...upgrades].map(([id, by]) => [id, [...by].toSorted()])),
  });

  // NEU's bonus tables: a slayer level gives the stats of the highest level key at or under it
  const bonuses = await readJson<{
    bonus_stats: Record<string, Record<string, Record<string, number>>>;
    pet_rewards: Record<string, { magic_find: number }>;
  }>("constants/bonuses.json");
  const perLevel = (table: Record<string, Record<string, number>>, levels: number) => {
    let current: Record<string, number> = {};
    return Array.from({ length: levels }, (_, i) => (current = table[i + 1] ? neuStats(table[i + 1]) : current));
  };

  await write("stats.json", {
    base: neuStats(misc.base_stats),
    // Each level's unlocks, as lore lines: "+2<glyph> Health", "Farmhand XV   Grants +56➜60 <glyph> Farming Fortune, …"
    skills: Object.fromEntries(
      Object.entries(skills).map(([id, { levels }]) => [
        id.toLowerCase(),
        levels.map(({ unlocks = [] }) => statTotals(unlocks.flatMap((line) => statRewards(normalizeItemText(line))))),
      ])
    ),
    slayers: Object.fromEntries(
      Object.entries(bonuses.bonus_stats)
        .filter(([id]) => id.startsWith("slayer_"))
        .map(([id, table]) => [id.slice("slayer_".length), perLevel(table, slayerXp[id.slice("slayer_".length)].length)])
    ),
    pet_score: Object.fromEntries(
      Object.entries(bonuses.pet_rewards).flatMap(([score, { magic_find }]) => (magic_find ? [[score, magic_find]] : []))
    ),
  });

  // Each pet's stats at its first and last stat level by rarity; the 200-level dragons' stats run from 101 to 200
  const petnums = await readJson<
    Record<string, Record<string, Record<string, { statNums: Record<string, number> }> & { stats_levelling_curve?: string }>>
  >("constants/petnums.json");
  await write(
    "petnums.json",
    Object.fromEntries(
      Object.entries(petnums).map(([type, rarities]) => [
        type,
        Object.fromEntries(
          Object.entries(rarities).map(([rarity, { 1: first, 100: last, stats_levelling_curve: curve }]) => [
            rarity,
            {
              first: neuStats(first.statNums),
              last: neuStats(last.statNums),
              levels: curve?.split(":").slice(0, 2).map(Number),
            },
          ])
        ),
      ])
    )
  );

  const minecraftData = async (file: "blocks" | "items") => {
    const url = `https://raw.githubusercontent.com/${MINECRAFT_DATA}/${MINECRAFT_DATA_SHA}/data/pc/1.8/${file}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} answered ${response.status}`);
    return (await response.json()) as MinecraftItem[];
  };

  // "<id>:<damage>" per variant and "<id>" for damage 0; ./icons tries both.
  const minecraftItems = await minecraftData("items");
  const textures: Record<string, string> = {};
  const unmapped: string[] = [];

  for (const { id, name, variations } of minecraftItems) {
    for (const damage of variations?.map(({ metadata }) => metadata) ?? [0]) {
      const path = texturePath(name, damage);
      if (!path) {
        unmapped.push(`${name}:${damage}`);
        continue;
      }

      if (variations) textures[`${id}:${damage}`] = path;
      if (damage === 0) textures[id] = path;
    }
  }

  // items.json repeats each block's item under the block's id, so those ids take the block's name.
  const minecraftBlocks = await minecraftData("blocks");
  const blockIds = new Set(minecraftBlocks.map(({ id }) => id));
  const materials = Object.fromEntries([
    ...minecraftBlocks.map(({ id, name }) => [MATERIAL_NAMES.blocks[name] ?? name.toUpperCase(), id]),
    ...minecraftItems
      .filter(({ id }) => !blockIds.has(id))
      .map(({ id, name }) => [MATERIAL_NAMES.items[name] ?? name.toUpperCase(), id]),
  ]);

  await write("textures-1.8.json", { materials, textures });

  await write("source.json", {
    minecraftData: { repo: `https://github.com/${MINECRAFT_DATA}`, sha: MINECRAFT_DATA_SHA },
    repo: `https://github.com/${REPO}`,
    sha,
    skills: { url: HYPIXEL_SKILLS, version: skillsVersion },
    collections: { url: HYPIXEL_COLLECTIONS, version: collectionsVersion },
    syncedAt: new Date().toISOString(),
  });

  // Each key is a Mongo path and a Redis key, so one that changes here leaves its old board behind
  await writeFile(
    new URL("../../schemas/src/skyblock/boards.json", import.meta.url),
    `${JSON.stringify(
      { collections: boards(collectionBoards(collectionData)), bestiary: boards(bestiaryBoards(bestiaryData)) },
      null,
      2
    )}\n`
  );
  const license = await readFile(join(dir, "LICENSE"), "utf8");
  await writeFile(
    new URL("NOTICE.md", out),
    `textures-1.8.json takes 1.8's block and item ids, names and variants from minecraft-data (https://github.com/${MINECRAFT_DATA}) at ${MINECRAFT_DATA_SHA}, which its README licenses as MIT.\n\nThe skill XP tables in leveling.json and the skill stats in stats.json come from Hypixel's SkyBlock skills resource (${HYPIXEL_SKILLS}), version ${skillsVersion}. collections.json comes from Hypixel's SkyBlock collections resource (${HYPIXEL_COLLECTIONS}), version ${collectionsVersion}.\n\nThe other JSON files here, and the base, slayer and pet score tables in stats.json, are derived from NEU-REPO (https://github.com/${REPO}) at ${sha}, under its MIT license:\n\n${license}`
  );

  console.log(
    `synced ${sha}: ${upgrades.size} upgradable accessories, ${Object.keys(petTextures).length} pet textures, ${Object.keys(skinTextures).length} pet skins, ${Object.keys(textures).length} item textures, ${Object.keys(materials).length} materials`
  );
  console.log(`no texture in the 1.8 pack: ${unmapped.join(" ")}`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
