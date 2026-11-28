/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Builds never fetch the sources, so run this by hand and commit the output.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  KUUDRA_TIERS,
  RARITIES,
  type PlayerStat,
  type PowerStat,
  type StatValue,
} from "#types";
import { add, roundTo } from "@statsify/math";
import { getBestiaryBoards, getCollectionBoards } from "@statsify/skyblock";
import { normalizeItemText, parseStatName, parseStatRewards } from "#lore";
import { prettify, removeFormatting } from "@statsify/util";
import { skinHash } from "#textures";
import { tmpdir } from "node:os";
import { toLevelCosts } from "#leveling";

const REPO = "NotEnoughUpdates/NotEnoughUpdates-REPO";
const HYPIXEL_SKILLS = "https://api.hypixel.net/v2/resources/skyblock/skills";
const HYPIXEL_COLLECTIONS =
  "https://api.hypixel.net/v2/resources/skyblock/collections";
const SYNC_TIMEOUT = 60_000;

const MINECRAFT_DATA = "PrismarineJS/minecraft-data";
// This is minecraft-data 3.117.0.
const MINECRAFT_DATA_SHA = "15411f050f040e4c5df09352a75a9912ad8c3eeb";
const PACK = new URL(
  "../../../assets/public/minecraft-textures/default/assets/minecraft/textures/",
  import.meta.url,
);

const COLORS = [
  "white",
  "orange",
  "magenta",
  "light_blue",
  "yellow",
  "lime",
  "pink",
  "gray",
  "silver",
  "cyan",
  "purple",
  "blue",
  "brown",
  "green",
  "red",
  "black",
] as const;
const WOODS = [
  "oak",
  "spruce",
  "birch",
  "jungle",
  "acacia",
  "big_oak",
] as const;
const blockPaths = (names: Iterable<string>, prefix = "") =>
  Array.from(names, (name) => `blocks/${prefix}${name}`);

// Icons that aren't items/<name> or blocks/<name>, a list indexed by Damage.
const TEXTURES: Record<string, string | string[]> = {
  stone: blockPaths([
    "stone",
    "stone_granite",
    "stone_granite_smooth",
    "stone_diorite",
    "stone_diorite_smooth",
    "stone_andesite",
    "stone_andesite_smooth",
  ]),
  grass: "blocks/grass_side",
  dirt: blockPaths(["dirt", "coarse_dirt", "dirt_podzol_side"]),
  planks: blockPaths(WOODS, "planks_"),
  sapling: blockPaths(
    ["oak", "spruce", "birch", "jungle", "acacia", "roofed_oak"],
    "sapling_",
  ),
  sand: blockPaths(["sand", "red_sand"]),
  log: blockPaths(WOODS, "log_"),
  leaves: blockPaths(WOODS.slice(0, 4), "leaves_"),
  sponge: blockPaths(["sponge", "sponge_wet"]),
  dispenser: "blocks/dispenser_front_horizontal",
  sandstone: blockPaths(["normal", "carved", "smooth"], "sandstone_"),
  golden_rail: "blocks/rail_golden",
  detector_rail: "blocks/rail_detector",
  sticky_piston: "blocks/piston_top_sticky",
  tallgrass: blockPaths(["deadbush", "tallgrass", "fern"]),
  piston: "blocks/piston_top_normal",
  wool: blockPaths(COLORS, "wool_colored_"),
  yellow_flower: "blocks/flower_dandelion",
  red_flower: blockPaths(
    [
      "rose",
      "blue_orchid",
      "allium",
      "houstonia",
      "tulip_red",
      "tulip_orange",
      "tulip_white",
      "tulip_pink",
      "oxeye_daisy",
    ],
    "flower_",
  ),
  brown_mushroom: "blocks/mushroom_brown",
  red_mushroom: "blocks/mushroom_red",
  stone_slab: blockPaths([
    "stone_slab_side",
    "sandstone_normal",
    "planks_oak",
    "cobblestone",
    "brick",
    "stonebrick",
    "nether_brick",
    "quartz_block_side",
  ]),
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
  stained_glass: blockPaths(COLORS, "glass_"),
  monster_egg: blockPaths([
    "stone",
    "cobblestone",
    "stonebrick",
    "stonebrick_mossy",
    "stonebrick_cracked",
    "stonebrick_carved",
  ]),
  stonebrick: blockPaths(["", "_mossy", "_cracked", "_carved"], "stonebrick"),
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
  wooden_slab: blockPaths(WOODS, "planks_"),
  sandstone_stairs: "blocks/sandstone_normal",
  ender_chest: "entity/chest/ender",
  spruce_stairs: "blocks/planks_spruce",
  birch_stairs: "blocks/planks_birch",
  jungle_stairs: "blocks/planks_jungle",
  cobblestone_wall: blockPaths(["cobblestone", "cobblestone_mossy"]),
  wooden_button: "blocks/planks_oak",
  anvil: blockPaths(["0", "1", "2"], "anvil_top_damaged_"),
  trapped_chest: "entity/chest/trapped",
  light_weighted_pressure_plate: "blocks/gold_block",
  heavy_weighted_pressure_plate: "blocks/iron_block",
  daylight_detector: "blocks/daylight_detector_top",
  quartz_block: blockPaths(["side", "chiseled", "lines"], "quartz_block_"),
  quartz_stairs: "blocks/quartz_block_side",
  activator_rail: "blocks/rail_activator",
  dropper: "blocks/dropper_front_horizontal",
  stained_hardened_clay: blockPaths(COLORS, "hardened_clay_stained_"),
  stained_glass_pane: blockPaths(COLORS, "glass_"),
  leaves2: blockPaths(["acacia", "big_oak"], "leaves_"),
  log2: blockPaths(["acacia", "big_oak"], "log_"),
  acacia_stairs: "blocks/planks_acacia",
  dark_oak_stairs: "blocks/planks_big_oak",
  prismarine: blockPaths(["rough", "bricks", "dark"], "prismarine_"),
  hay_block: "blocks/hay_block_side",
  carpet: blockPaths(COLORS, "wool_colored_"),
  packed_ice: "blocks/ice_packed",
  double_plant: blockPaths(
    [
      "sunflower_front",
      "syringa_top",
      "grass_top",
      "fern_top",
      "rose_top",
      "paeonia_top",
    ],
    "double_plant_",
  ),
  red_sandstone: blockPaths(["normal", "carved", "smooth"], "red_sandstone_"),
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
  fish: [
    "items/fish_cod_raw",
    "items/fish_salmon_raw",
    "items/tropical_fish",
    "items/fish_pufferfish_raw",
  ],
  cooked_fish: ["items/fish_cod_cooked", "items/fish_salmon_cooked"],
  // The pack has 1.14's red and yellow dye in place of 1.8's dye powders.
  dye: COLORS.toReversed().map((color) =>
    color === "red" || color === "yellow"
      ? `items/${color}_dye`
      : `items/dye_powder_${color}`,
  ),
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
  skull: [
    "entity/skeleton/skeleton",
    "entity/skeleton/wither_skeleton",
    "entity/zombie/zombie",
    "entity/steve",
    "entity/creeper/creeper",
  ],
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

// Material names that differ from minecraft-data's, apart since some repeat.
const MATERIAL_NAMES: Record<"blocks" | "items", Record<string, string>> = {
  blocks: {
    bed: "BED_BLOCK",
    birch_stairs: "BIRCH_WOOD_STAIRS",
    brick_block: "BRICK",
    brown_mushroom_block: "HUGE_MUSHROOM_1",
    cake: "CAKE_BLOCK",
    carrots: "CARROT",
    cobblestone_wall: "COBBLE_WALL",
    command_block: "COMMAND",
    crafting_table: "WORKBENCH",
    deadbush: "DEAD_BUSH",
    double_stone_slab: "DOUBLE_STEP",
    double_wooden_slab: "WOOD_DOUBLE_STEP",
    enchanting_table: "ENCHANTMENT_TABLE",
    end_portal: "ENDER_PORTAL",
    end_portal_frame: "ENDER_PORTAL_FRAME",
    end_stone: "ENDER_STONE",
    farmland: "SOIL",
    flowing_lava: "LAVA",
    flowing_water: "WATER",
    glass_pane: "THIN_GLASS",
    golden_rail: "POWERED_RAIL",
    hardened_clay: "HARD_CLAY",
    heavy_weighted_pressure_plate: "IRON_PLATE",
    iron_bars: "IRON_FENCE",
    iron_door: "IRON_DOOR_BLOCK",
    jungle_stairs: "JUNGLE_WOOD_STAIRS",
    lava: "STATIONARY_LAVA",
    leaves2: "LEAVES_2",
    light_weighted_pressure_plate: "GOLD_PLATE",
    lit_furnace: "BURNING_FURNACE",
    lit_pumpkin: "JACK_O_LANTERN",
    lit_redstone_lamp: "REDSTONE_LAMP_ON",
    lit_redstone_ore: "GLOWING_REDSTONE_ORE",
    log2: "LOG_2",
    monster_egg: "MONSTER_EGGS",
    mycelium: "MYCEL",
    nether_brick_fence: "NETHER_FENCE",
    nether_wart: "NETHER_WARTS",
    noteblock: "NOTE_BLOCK",
    oak_stairs: "WOOD_STAIRS",
    piston: "PISTON_BASE",
    piston_extension: "PISTON_MOVING_PIECE",
    piston_head: "PISTON_EXTENSION",
    planks: "WOOD",
    potatoes: "POTATO",
    powered_comparator: "REDSTONE_COMPARATOR_ON",
    powered_repeater: "DIODE_BLOCK_ON",
    rail: "RAILS",
    red_flower: "RED_ROSE",
    red_mushroom_block: "HUGE_MUSHROOM_2",
    redstone_lamp: "REDSTONE_LAMP_OFF",
    redstone_torch: "REDSTONE_TORCH_ON",
    reeds: "SUGAR_CANE_BLOCK",
    slime: "SLIME_BLOCK",
    snow: "SNOW_BLOCK",
    snow_layer: "SNOW",
    spruce_stairs: "SPRUCE_WOOD_STAIRS",
    stained_hardened_clay: "STAINED_CLAY",
    standing_sign: "SIGN_POST",
    sticky_piston: "PISTON_STICKY_BASE",
    stone_brick_stairs: "SMOOTH_STAIRS",
    stone_pressure_plate: "STONE_PLATE",
    stone_slab: "STEP",
    stone_stairs: "COBBLESTONE_STAIRS",
    stonebrick: "SMOOTH_BRICK",
    tallgrass: "LONG_GRASS",
    trapdoor: "TRAP_DOOR",
    unlit_redstone_torch: "REDSTONE_TORCH_OFF",
    unpowered_comparator: "REDSTONE_COMPARATOR_OFF",
    unpowered_repeater: "DIODE_BLOCK_OFF",
    water: "STATIONARY_WATER",
    waterlily: "WATER_LILY",
    wheat: "CROPS",
    wooden_button: "WOOD_BUTTON",
    wooden_pressure_plate: "WOOD_PLATE",
    wooden_slab: "WOOD_STEP",
  },
  items: {
    acacia_door: "ACACIA_DOOR_ITEM",
    beef: "RAW_BEEF",
    birch_door: "BIRCH_DOOR_ITEM",
    brewing_stand: "BREWING_STAND_ITEM",
    brick: "CLAY_BRICK",
    carrot: "CARROT_ITEM",
    carrot_on_a_stick: "CARROT_STICK",
    cauldron: "CAULDRON_ITEM",
    chest_minecart: "STORAGE_MINECART",
    chicken: "RAW_CHICKEN",
    clock: "WATCH",
    command_block_minecart: "COMMAND_MINECART",
    comparator: "REDSTONE_COMPARATOR",
    cooked_porkchop: "GRILLED_PORK",
    dark_oak_door: "DARK_OAK_DOOR_ITEM",
    diamond_horse_armor: "DIAMOND_BARDING",
    diamond_shovel: "DIAMOND_SPADE",
    dye: "INK_SACK",
    ender_eye: "EYE_OF_ENDER",
    experience_bottle: "EXP_BOTTLE",
    filled_map: "MAP",
    fire_charge: "FIREBALL",
    fireworks: "FIREWORK",
    fish: "RAW_FISH",
    flower_pot: "FLOWER_POT_ITEM",
    furnace_minecart: "POWERED_MINECART",
    golden_axe: "GOLD_AXE",
    golden_boots: "GOLD_BOOTS",
    golden_chestplate: "GOLD_CHESTPLATE",
    golden_helmet: "GOLD_HELMET",
    golden_hoe: "GOLD_HOE",
    golden_horse_armor: "GOLD_BARDING",
    golden_leggings: "GOLD_LEGGINGS",
    golden_pickaxe: "GOLD_PICKAXE",
    golden_shovel: "GOLD_SPADE",
    golden_sword: "GOLD_SWORD",
    gunpowder: "SULPHUR",
    iron_horse_armor: "IRON_BARDING",
    iron_shovel: "IRON_SPADE",
    jungle_door: "JUNGLE_DOOR_ITEM",
    lead: "LEASH",
    map: "EMPTY_MAP",
    mushroom_stew: "MUSHROOM_SOUP",
    nether_wart: "NETHER_STALK",
    netherbrick: "NETHER_BRICK_ITEM",
    porkchop: "PORK",
    potato: "POTATO_ITEM",
    record_13: "GOLD_RECORD",
    record_blocks: "RECORD_3",
    record_cat: "GREEN_RECORD",
    record_chirp: "RECORD_4",
    record_far: "RECORD_5",
    record_mall: "RECORD_6",
    record_mellohi: "RECORD_7",
    record_stal: "RECORD_8",
    record_strad: "RECORD_9",
    record_wait: "RECORD_12",
    record_ward: "RECORD_10",
    reeds: "SUGAR_CANE",
    repeater: "DIODE",
    skull: "SKULL_ITEM",
    snowball: "SNOW_BALL",
    spawn_egg: "MONSTER_EGG",
    spruce_door: "SPRUCE_DOOR_ITEM",
    stone_shovel: "STONE_SPADE",
    tnt_minecart: "EXPLOSIVE_MINECART",
    wheat_seeds: "SEEDS",
    wooden_axe: "WOOD_AXE",
    wooden_door: "WOOD_DOOR",
    wooden_hoe: "WOOD_HOE",
    wooden_pickaxe: "WOOD_PICKAXE",
    wooden_shovel: "WOOD_SPADE",
    wooden_sword: "WOOD_SWORD",
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
  const path = Array.isArray(rule)
    ? rule[damage]
    : (rule ?? [`items/${name}`, `blocks/${name}`].find(inPack));
  return path && inPack(path) ? path : undefined;
};

// It runs on a full NEU-REPO commit SHA, so NOTICE.md pins what it read.
const sha = process.argv[2] ?? "";
if (!/^[\da-f]{40}$/.test(sha)) {
  throw new Error("usage: node scripts/sync-data.ts <full commit sha>");
}

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

async function fetchHypixelResource<T>(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(SYNC_TIMEOUT),
  });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return (await response.json()) as T & { version: string };
}

interface NeuPerk {
  name: string;
  x: number;
  y: number;
  maxLevel: number;
  stat?: string;
  lore?: unknown[];
}

// Rounding to 4 places drops the float noise of running totals.
function sumStatValues(values: StatValue[]) {
  const totals: Partial<Record<PlayerStat, number>> = {};
  for (const { stat, value } of values) {
    totals[stat] = add(totals[stat] ?? 0, value);
  }

  return Object.fromEntries(
    Object.entries(totals)
      .filter(([, value]) => value !== 0)
      .map(([stat, value]) => [stat, roundTo(value, 4)]),
  );
}

// NEU's ids for a stat that isn't a player's, like damage, are left out.
function readNeuStats(stats: Record<string, number>) {
  const values: StatValue[] = [];
  for (const [id, value] of Object.entries(stats)) {
    const stat = parseStatName(prettify(id));
    if (stat) values.push({ stat, value });
  }

  return sumStatValues(values);
}

// NEU writes a perk's stat as an expression like (+ 5 (* level 0.1)).
function evaluatePerkExpression(expression: string, level: number): number {
  const tokens = expression
    .replaceAll("(", " ( ")
    .replaceAll(")", " ) ")
    .trim()
    .split(/\s+/);

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

// The patterns are anchored, so a perk that grants a stat "when mining" fails.
function readPerkStats({ lore = [], stat: expression, maxLevel }: NeuPerk) {
  const text = removeFormatting(
    normalizeItemText(
      lore.filter((line) => typeof line === "string").join(" "),
    ),
  )
    .replaceAll(/[^\w{}+.' ]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();

  const fixed = /^Increase (.+) by ([\d.]+) and (.+) by ([\d.]+)\.$/.exec(text);
  if (fixed) {
    const stats: { id: PlayerStat; base: number; perLevel: number }[] = [];
    for (const [name, value] of [
      [fixed[1], fixed[2]],
      [fixed[3], fixed[4]],
    ]) {
      const id = parseStatName(name);
      if (id) stats.push({ id, base: Number(value), perLevel: 0 });
    }

    return stats.length > 0 ? stats : undefined;
  }

  const name =
    /^Grants \+?\{stats?\} (.+)\.$/.exec(text)?.[1] ??
    /^Increase (.+) by \{stat\}\.$/.exec(text)?.[1] ??
    /^You gain \{stat\} (.+)\.$/.exec(text)?.[1];
  const id = name && parseStatName(name);
  if (!id || !expression) return undefined;

  const at = (level: number) => evaluatePerkExpression(expression, level);
  const perLevel = roundTo(at(2) - at(1), 6);
  const base = roundTo(at(1) - perLevel, 6);
  if (Math.abs(base + perLevel * maxLevel - at(maxLevel)) > 1e-6) {
    throw new Error(`${expression} isn't linear in level`);
  }

  return [{ id, base, perLevel }];
}

function readNamedStats(text: string, pattern: RegExp, sign: 1 | -1) {
  const values: StatValue[] = [];
  for (const [, name, value] of text.matchAll(pattern)) {
    const stat = parseStatName(name);
    if (stat) values.push({ stat, value: sign * Number(value) });
  }

  return values;
}

// A sentence with a condition, like "while mining Titanium", gives no stats.
function readPetItem(lore: string[]) {
  const text = removeFormatting(
    lore.map(normalizeItemText).join(" "),
  ).replaceAll(/\s+/g, " ");
  const sentences = text.split(/(?<=[.!]) /);

  const flat: StatValue[] = [];
  for (const sentence of sentences) {
    if (!sentence.startsWith("Grants ")) continue;
    if (/\b(?:when|while|for each|for every|per)\b/.test(sentence)) continue;

    flat.push(
      ...parseStatRewards(sentence),
      ...readNamedStats(
        sentence,
        /reduces your \W*([A-Z][\w ]+?) by ([\d.]+)/g,
        -1,
      ),
    );
  }

  const raised = sentences.flatMap((sentence) => {
    const list = /^Increases (?:the|this) pet's (.+)\.$/.exec(sentence)?.[1];
    return readNamedStats(list ?? "", /\W*([A-Z][\w ]+?) by ([\d.]+)%/g, 1);
  });

  const everyStat = /Increases all pet stats by ([\d.]+)%/.exec(text)?.[1];

  const effect = {
    stats: flat.length > 0 ? sumStatValues(flat) : undefined,
    petStats: raised.length > 0 ? sumStatValues(raised) : undefined,
    allPetStats: everyStat ? Number(everyStat) : undefined,
  };

  const empty = !effect.stats && !effect.petStats && !effect.allPetStats;
  return empty ? undefined : effect;
}

interface NeuItem {
  internalname: string;
  displayname: string;
  lore?: string[];
  nbttag: string;
}

const GRANT_TERM =
  /^(?:([+-][\d,.]+)[^\s\w%]? )?(?:[^\s\w] )?([A-Z][\w']*(?: [A-Z][\w']*)*)$/;

// An attribute's level I lore can grant stats, as in "Grants +0.5 Magic Find."
function readAttributeGrants(lore: string[]) {
  const lines = lore
    .slice(1)
    .map((line) => removeFormatting(normalizeItemText(line)).trim());
  const end = lines.findIndex((line) => line.endsWith(".")) + 1;
  const sentence = lines.slice(0, end).join(" ").replaceAll(/\s+/g, " ");
  // A "which" clause only describes the stat.
  const list = /^Grants (.+?)(?: which [^.]+)?\.$/.exec(sentence)?.[1];
  if (!list) return;

  const grants: { stat: PlayerStat; value: number }[] = [];
  // One amount covers the stats after it, as in "+1 ☘ Mining, ☘ Farming".
  let value: number | undefined;
  for (const term of list.split(/,? and |, /)) {
    const [, amount, name] = GRANT_TERM.exec(term) ?? [];
    if (amount) value = Number(amount.replaceAll(",", ""));
    const stat = name && parseStatName(name);
    // A conditional grant, like one against some mobs, gives no stats.
    if (!stat || value === undefined) return;
    grants.push({ stat, value });
  }

  return grants;
}

const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(join(dir, path), "utf8")) as T;

// Sorted keys at every depth keep a resync's diff to real changes.
const sorted = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sorted);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, sorted(child)]),
  );
};

// Files wait for the board checks, so a failed run leaves src/generated alone.
const pending = new Map<string, string>();
const write = (file: string, data: unknown) =>
  pending.set(file, `${JSON.stringify(sorted(data), null, 2)}\n`);

const toBoardEntries = (list: { key: string; name: string }[]) =>
  list.map(({ key, name }) => [key, name]);

// A shared key merges two boards, and a dropped one keeps its old scores.
function checkBoards(kind: string, old: string[][], next: string[][]) {
  const keys = next.map(([key]) => key);
  const shared = [
    ...new Set(keys.filter((key, index) => keys.indexOf(key) !== index)),
  ];
  if (shared.length > 0) {
    throw new Error(`${kind} boards share keys: ${shared.join(", ")}`);
  }

  const removed = old.map(([key]) => key).filter((key) => !keys.includes(key));
  if (removed.length > 0 && process.env.ALLOW_REMOVED_BOARDS !== "1") {
    throw new Error(
      `${kind} boards removed: ${removed.join(", ")}. Rerun with ALLOW_REMOVED_BOARDS=1 to drop them anyway.`,
    );
  }
}

const skullHash = (nbt: string) => {
  const value = /Value:"([\w+/=]+)"/.exec(nbt)?.[1];
  return value && skinHash(value);
};

const toTreeLayout = (perks: Record<string, NeuPerk>) =>
  Object.fromEntries(
    Object.entries(perks).map(([id, perk]) => [
      id,
      {
        name: perk.name,
        x: perk.x,
        y: perk.y,
        maxLevel: perk.maxLevel,
        stats: readPerkStats(perk),
      },
    ]),
  );

// A power stone's lore lists its Power's stats at a set accessory power.
function readPowerStone(lore: string[]) {
  const text = lore.map(removeFormatting);
  const name = /unlock the (.+?) power\./.exec(text.join(" "))?.[1];
  const statsAt = text.findIndex((line) =>
    /^At \d+ Accessory Power:$/.test(line),
  );
  if (!name || statsAt === -1) return;

  const bonusAt = text.indexOf("Unique Power Bonus:");
  const readStats = (at: number): PowerStat[] =>
    lore.slice(at + 1, lore.indexOf("", at)).map((line) => {
      const [, color, value, stat] = /^(§.)([+-][\d.]+)\S* (.+)$/.exec(line)!;
      return { name: stat, color, value: Number(value) };
    });

  const power = {
    accessoryPower: Number(/\d+/.exec(text[statsAt])![0]),
    stats: readStats(statsAt),
    bonus: bonusAt === -1 ? [] : readStats(bonusAt),
  };
  return [name.toLowerCase().replaceAll(" ", "_"), power] as const;
}

interface NeuFamily {
  name: string;
  mobs: string[];
  cap: number;
  bracket: number;
  bracketType?: string;
}

interface NeuBestiaryPage {
  name: string;
  mobs?: NeuFamily[];
  hasSubcategories?: boolean;
  [subpage: string]: unknown;
}

interface NeuBestiary {
  brackets: Record<string, number[]>;
  bracketSets: Record<string, Record<string, number[]>>;
}

// The wiki gives these families a bracket and cap of their own.
const WIKI_FAMILIES: Record<string, { bracket: string; cap: number }> = {
  Beeheemoth: { bracket: "CRITTERS_4", cap: 50 },
  Bogged: { bracket: "4", cap: 1000 },
  "Cretan Bull": { bracket: "5", cap: 1000 },
  Flipflopper: { bracket: "CRITTERS_2", cap: 100 },
  "Grizzly Bear": { bracket: "CRITTERS_5", cap: 25 },
  Honeyhog: { bracket: "CRITTERS_2", cap: 100 },
  Lotum: { bracket: "CRITTERS_2", cap: 100 },
  "Mithril Grubber": { bracket: "3", cap: 300 },
  "Oasis Rabbit": { bracket: "3", cap: 300 },
  "Oasis Sheep": { bracket: "3", cap: 300 },
  "Queen Ant": { bracket: "2", cap: 50 },
  "Stranded Nymph": { bracket: "5", cap: 1000 },
  Tidetot: { bracket: "CRITTERS_4", cap: 50 },
};

// NEU's families leave out these kill ids, which the saves have.
const MISSING_KILL_IDS: Record<string, string[]> = {
  "Cretan Bull": ["cretan_bull_40", "cretan_bull_70", "cretan_bull_95"],
  "Emerald Slime": ["emerald_slime_15"],
  "Minos Hunter": ["minos_hunter_25", "minos_hunter_80"],
  "Rain Slime": ["slimey_slime_50"],
  "Siamese Lynx": ["siamese_lynx_55"],
  "Stranded Nymph": [
    "stranded_nymph_40",
    "stranded_nymph_70",
    "stranded_nymph_95",
  ],
  Zealot: ["zealot_special_enderman_55"],
};

function getBestiaryBrackets({ brackets, bracketSets }: NeuBestiary) {
  const all: Record<string, number[]> = {
    ...brackets,
    // The wiki has 12, 16 and 20 kills for bracket 6's tiers 7 to 9.
    6: [...brackets[6].slice(0, 6), 12, 16, 20, ...brackets[6].slice(9)],
  };

  for (const [set, tiers] of Object.entries(bracketSets)) {
    for (const [n, kills] of Object.entries(tiers)) all[`${set}_${n}`] = kills;
  }

  return all;
}

// A family whose NEU bracket never reaches its cap ranks on the critter
// bracket that ends at it.
function getFamilyBracket(
  brackets: Record<string, number[]>,
  { name, cap }: { name: string; cap: number },
  given: string,
) {
  if (brackets[given].includes(cap)) return given;

  const ending = Object.keys(brackets).filter(
    (key) => key.startsWith("CRITTERS_") && brackets[key].at(-1) === cap,
  );
  if (ending.length !== 1) {
    throw new Error(
      `bestiary: ${name}'s cap ${cap} isn't a step of ${given} or the end of one critter bracket`,
    );
  }

  return ending[0];
}

function getBestiaryFamilies(
  brackets: Record<string, number[]>,
  { mobs = [] }: NeuBestiaryPage,
) {
  return mobs.map(
    ({ name: formatted, mobs: ids, cap, bracket, bracketType }) => {
      const name = removeFormatting(formatted);
      const wiki = WIKI_FAMILIES[name];
      const given = bracketType ? `${bracketType}_${bracket}` : String(bracket);
      return {
        name,
        ids: [...ids, ...(MISSING_KILL_IDS[name] ?? [])],
        cap: wiki?.cap ?? cap,
        bracket:
          wiki?.bracket ?? getFamilyBracket(brackets, { name, cap }, given),
      };
    },
  );
}

const isBestiaryPage = (value: unknown): value is NeuBestiaryPage =>
  typeof value === "object" && value !== null && "mobs" in value;

// The Fishing and Critter Safari pages list their subpages under a category.
async function readBestiary() {
  const { brackets, bracketSets, ...islands } = await readJson<
    NeuBestiary & Record<string, NeuBestiaryPage>
  >("constants/bestiary.json");
  const all = getBestiaryBrackets({ brackets, bracketSets });

  const pages: {
    category?: string;
    name: string;
    families: ReturnType<typeof getBestiaryFamilies>;
  }[] = [];
  for (const page of Object.values(islands)) {
    if (!page.hasSubcategories) {
      pages.push({ name: page.name, families: getBestiaryFamilies(all, page) });
      continue;
    }

    for (const sub of Object.values(page).filter(isBestiaryPage)) {
      pages.push({
        category: page.name,
        name: sub.name,
        families: getBestiaryFamilies(all, sub),
      });
    }
  }

  return { brackets: all, pages };
}

interface NeuAttributeShards {
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
}

// NEU still has the old names of these three attributes.
const ATTRIBUTE_NAMES: Record<string, string> = {
  almighty: "Almighty",
  pretty_clothes: "Pretty Clothes",
  visitor_bait: "Visitor Bait",
};

// NEU's families predate the 2026-08-24 change, which also dropped Elusive.
const SHARD_FAMILIES: Record<string, string[]> = {
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

// shards.owned keys a shard by its bazaar name, and attributes.stacks keys an
// attribute by the internal name.
async function readAttributeShards() {
  const shards = await readJson<NeuAttributeShards>(
    "constants/attribute_shards.json",
  );

  const read = shards.attributes.map(async (shard) => {
    const { bazaarName, displayName, internalName, family = [] } = shard;
    const { lore = [] } = await readJson<NeuItem>(
      join("items", `${internalName}.json`),
    );
    // Rainbug's bazaar name is empty, so its shard id is its name.
    const id = bazaarName
      ? bazaarName.replace(/^SHARD_/, "")
      : displayName.toUpperCase();
    const attribute = /^ATTRIBUTE_SHARD_(\w+);\d+$/
      .exec(internalName)![1]
      .toLowerCase();
    const families =
      SHARD_FAMILIES[id] ?? family.filter((name) => name !== "Elusive");
    const unconsumable = shards.unconsumable_attributes.includes(bazaarName);

    return {
      id,
      name: displayName,
      attribute,
      attributeName: ATTRIBUTE_NAMES[attribute] ?? shard.abilityName,
      rarity: shard.rarity,
      grants: readAttributeGrants(lore),
      families: families.length > 0 ? families : undefined,
      unconsumable: unconsumable || undefined,
    };
  });

  return {
    levels: shards.attribute_levelling,
    shards: await Promise.all(read),
  };
}

try {
  // NEU's Runecrafting table is wrong at five levels, so skills use Hypixel's.
  const [
    response,
    { skills, version: skillsVersion },
    { collections, version: collectionsVersion },
  ] = await Promise.all([
    fetch(`https://codeload.github.com/${REPO}/tar.gz/${sha}`, {
      signal: AbortSignal.timeout(SYNC_TIMEOUT),
    }),
    fetchHypixelResource<{ skills: Record<string, HypixelSkill> }>(
      HYPIXEL_SKILLS,
    ),
    fetchHypixelResource<{ collections: Record<string, HypixelCollections> }>(
      HYPIXEL_COLLECTIONS,
    ),
  ]);
  if (!response.ok) throw new Error(`codeload answered ${response.status}`);
  await writeFile(
    join(dir, "repo.tar.gz"),
    Buffer.from(await response.arrayBuffer()),
  );
  execFileSync("tar", ["-xzf", "repo.tar.gz", "--strip-components=1"], {
    cwd: dir,
  });

  const xpTable = (skill: string) =>
    toLevelCosts(
      skills[skill].levels.map(({ totalExpRequired }) => totalExpRequired),
    );

  const collectionData = Object.entries(collections).map(
    ([category, { name, items }]) => ({
      id: category,
      name,
      items: Object.entries(items).map(([id, item]) => ({
        id,
        name: item.name,
        tiers: item.tiers.map(({ amountRequired }) => amountRequired),
      })),
    }),
  );
  write("collections.json", collectionData);

  const leveling = await readJson<Record<string, unknown>>(
    "constants/leveling.json",
  );
  const slayerXp = leveling.slayer_xp as Record<string, number[]>;
  const { core_task, sblevel_colours } = await readJson<{
    core_task: Record<string, unknown>;
    sblevel_colours: Record<string, string>;
  }>("constants/sblevels.json");
  const fairySouls = await readJson<{ "Max Souls": number }>(
    "constants/fairy_souls.json",
  );
  write("leveling.json", {
    catacombs: leveling.catacombs,
    fairy_souls: fairySouls["Max Souls"],
    HOTF: leveling.HOTF,
    HOTM: leveling.HOTM,
    leveling_caps: leveling.leveling_caps,
    leveling_xp: xpTable("COMBAT"),
    max_levels: Object.fromEntries(
      Object.entries(skills).map(([id, { maxLevel }]) => [
        id.toLowerCase(),
        maxLevel,
      ]),
    ),
    runecrafting_xp: xpTable("RUNECRAFTING"),
    sblevel_colours,
    // NEU copies Revenant's 15 XP for Tarantula level 2, but the game asks 25.
    slayer_xp: { ...slayerXp, spider: slayerXp.spider.with(1, 25) },
    slayer_to_highest_tier: leveling.slayer_to_highest_tier,
    social: xpTable("SOCIAL"),
  });

  write("sblevels.json", {
    core_task: {
      accessory_bag_xp: core_task.accessory_bag_xp,
      pet_score_xp: core_task.pet_score_xp,
    },
  });

  const [{ hotm }, { hotf }] = await Promise.all([
    readJson<{ hotm: { perks: Record<string, NeuPerk> } }>(
      "constants/hotmlayout.json",
    ),
    readJson<{ hotf: { perks: Record<string, NeuPerk> } }>(
      "constants/hotflayout.json",
    ),
  ]);
  write("hotmlayout.json", toTreeLayout(hotm.perks));
  write("hotflayout.json", toTreeLayout(hotf.perks));

  const { hoppity } = await readJson<{
    hoppity: { rarities: Record<string, { rabbits: string[] }> };
  }>("constants/hoppity.json");
  write(
    "hoppity.json",
    Object.fromEntries(
      Object.entries(hoppity.rarities).map(([rarity, { rabbits }]) => [
        rarity,
        rabbits,
      ]),
    ),
  );

  const bestiaryData = await readBestiary();
  write("bestiary.json", bestiaryData);
  write("attribute-shards.json", await readAttributeShards());

  // player_data.perks spells NEU's eagle_advantage as eagles_advantage.
  const apiPerkIds: Record<string, string> = {
    eagle_advantage: "eagles_advantage",
  };
  const shops = await readJson<
    Record<string, Record<string, { costs: number[] }>>
  >("constants/essenceshops.json");
  write("essenceshops.json", {
    ...Object.fromEntries(
      Object.entries(shops).map(([shop, perks]) => [
        shop.replace("ESSENCE_", ""),
        Object.fromEntries(
          Object.entries(perks).map(([id, { costs }]) => [
            apiPerkIds[id] ?? id,
            costs.length,
          ]),
        ),
      ]),
    ),
    // NEU lacks the Rift's Sun Gecko shop, so its one perk is from the wiki.
    SUN_GECKO: { blessing_of_time: 3 },
  });

  // NEU keys milestones by crop name, but the Garden uses collection ids.
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
  // The wiki's Garden pages fix NEU's milestones and two visitors' rarities.
  const wheatTiers = { 21: 325_000, 23: 500_000 };
  const caneTiers = { 21: 650_000, 23: 1_000_000 };
  const cocoaTiers = {
    3: 250,
    4: 500,
    5: 1000,
    6: 2000,
    7: 4000,
    9: 10_000,
    11: 20_000,
    12: 25_000,
    14: 50_000,
    15: 100_000,
    17: 200_000,
    19: 500_000,
    21: 1_000_000,
    22: 1_300_000,
    23: 1_600_000,
    24: 2_000_000,
  };
  const milestoneFixes: Record<string, Record<number, number>> = {
    WHEAT: wheatTiers,
    PUMPKIN: wheatTiers,
    MUSHROOM: wheatTiers,
    SUNFLOWER: wheatTiers,
    MOONFLOWER: wheatTiers,
    SUGAR_CANE: caneTiers,
    CACTUS: caneTiers,
    WILD_ROSE: caneTiers,
    COCOA_BEANS: cocoaTiers,
    NETHER_WART: cocoaTiers,
    MELON: {
      5: 1800,
      20: 1_200_000,
      21: 1_600_000,
      23: 2_500_000,
      24: 3_200_000,
    },
  };
  write("garden.json", {
    garden_exp: garden.garden_exp,
    crop_milestones: Object.fromEntries(
      Object.entries(garden.crop_milestones).map(([crop, tiers]) => [
        gardenCrops[crop] ?? crop,
        tiers.map((amount, i) => milestoneFixes[crop]?.[i + 1] ?? amount),
      ]),
    ),
    visitors: {
      ...garden.visitors,
      bednom: "UNCOMMON",
      farm_merchant: "UNCOMMON",
    },
    plots: Object.keys(garden.plots).toSorted(),
    crop_upgrades: garden.crop_upgrades.length,
    composter_upgrades: Object.fromEntries(
      Object.entries(garden.composter_upgrades).map(([id, levels]) => [
        id,
        Object.keys(levels).length,
      ]),
    ),
  });

  const accessoryRanks = new Map<string, number>();
  // NEU gives each Abicase model and party hat color its own id.
  const apiIds = new Map<string, string>();
  const petTextures: Record<string, Record<string, string>> = {};
  const petNames: Record<string, string> = {};
  const skinTextures: Record<string, string> = {};
  const kuudraKeys: Record<string, string> = {};
  const trophyFish = new Set(
    Object.keys(
      await readJson<Record<string, number[]>>("constants/trophyfish.json"),
    ),
  );
  const trophyNames: Record<string, string> = {};
  const petItems: Record<
    string,
    NonNullable<ReturnType<typeof readPetItem>>
  > = {};
  const files = (await readdir(join(dir, "items"))).filter((file) =>
    file.endsWith(".json"),
  );
  const items = await Promise.all(
    files.map((file) => readJson<NeuItem>(join("items", file))),
  );

  for (const item of items) {
    // A pet's internal name is "<TYPE>;<index in RARITIES>".
    const pet = item.nbttag.includes("petInfo")
      ? /^(.+);(\d)$/.exec(item.internalname)
      : null;
    const hash = pet && skullHash(item.nbttag);
    if (pet && hash) {
      (petTextures[pet[1]] ??= {})[RARITIES[Number(pet[2])]] = hash;
    }

    if (pet) {
      const name = removeFormatting(item.displayname).replace(
        /^\[Lvl [^\]]+\] /,
        "",
      );
      // Keep only the names prettify gets wrong, like Montezuma's.
      if (name !== prettify(pet[1])) petNames[pet[1]] ??= name;
    }

    // The basic tier's key is KUUDRA_TIER_KEY, and the API calls it "none".
    const kuudraKey = /^KUUDRA_(?:(\w+)_)?TIER_KEY$/.exec(item.internalname);
    const keyHash = kuudraKey && skullHash(item.nbttag);
    if (kuudraKey && keyHash) {
      kuudraKeys[kuudraKey[1]?.toLowerCase() ?? "none"] = keyHash;
    }

    // For example "§fSulphur Skitter §8§lBRONZE" for SULPHUR_SKITTER_BRONZE.
    const trophy = /^(\w+)_BRONZE$/.exec(item.internalname);
    if (trophy && trophyFish.has(trophy[1])) {
      trophyNames[trophy[1]] = removeFormatting(item.displayname).replace(
        / BRONZE$/,
        "",
      );
    }

    const skin =
      item.internalname.startsWith("PET_SKIN_") && skullHash(item.nbttag);
    if (skin) skinTextures[item.internalname.slice("PET_SKIN_".length)] = skin;

    // For example "§a§lUNCOMMON PET ITEM".
    const rarityLine = removeFormatting(item.lore?.at(-1) ?? "");
    const petItem =
      rarityLine.endsWith("PET ITEM") && readPetItem(item.lore ?? []);
    if (petItem) petItems[item.internalname] = petItem;

    // For example "§9§lRARE DUNGEON ACCESSORY" or "§5§lEPIC HATCESSORY".
    const kind = /^(.+?)(?: DUNGEON)? (?:ACCESSORY|HATCESSORY)$/.exec(
      removeFormatting(item.lore?.at(-1) ?? "").trim(),
    );
    if (!kind) continue;

    accessoryRanks.set(
      item.internalname,
      RARITIES.findIndex((rarity) => rarity === kind[1].replaceAll(" ", "_")),
    );
    const variant = /(?:model|party_hat_color|party_hat_emoji):"([^"]+)"/.exec(
      item.nbttag,
    )?.[1];
    if (variant) {
      apiIds.set(
        item.internalname,
        item.internalname.replace(`_${variant.toUpperCase()}`, ""),
      );
    }
  }

  write("pet-textures.json", { pets: petTextures, skins: skinTextures });

  const stones = items
    .map((item) => readPowerStone(item.lore ?? []))
    .filter((stone) => stone !== undefined);
  write("powers.json", Object.fromEntries(stones));

  const keyless = KUUDRA_TIERS.filter((tier) => !kuudraKeys[tier]);
  if (keyless.length > 0) {
    throw new Error(`no Kuudra key head for ${keyless.join(", ")}`);
  }
  write("kuudra-keys.json", kuudraKeys);
  write("trophyfish.json", trophyNames);
  write("pet-items.json", petItems);

  const pets = await readJson<Record<string, unknown>>("constants/pets.json");
  const offsets = pets.pet_rarity_offset as Record<string, number>;
  write("pets.json", {
    custom_pet_leveling: pets.custom_pet_leveling,
    id_to_display_name: {
      ...petNames,
      ...(pets.id_to_display_name as Record<string, string>),
    },
    pet_levels: pets.pet_levels,
    // NEU levels SPECIAL pets on Epic's table, but the game uses Legendary's.
    pet_rarity_offset: { ...offsets, SPECIAL: offsets.LEGENDARY },
  });

  const api = (id: string) => apiIds.get(id) ?? id;
  const upgrades = new Map<string, Set<string>>();
  const supersede = (id: string, upgrade: string) => {
    if (api(id) === api(upgrade)) return;
    // NEU lists a few lower tiers as upgrades, like Powder of the Many.
    if (accessoryRanks.get(upgrade)! < accessoryRanks.get(id)!) return;

    const known = upgrades.get(api(id)) ?? new Set();
    upgrades.set(api(id), known.add(api(upgrade)));
  };

  const misc = await readJson<{
    base_stats: Record<string, number>;
    ignored_talisman: string[];
    talisman_upgrades: Record<string, string[]>;
  }>("constants/misc.json");
  for (const [id, list] of Object.entries(misc.talisman_upgrades)) {
    for (const upgrade of list) supersede(id, upgrade);
  }

  // talisman_upgrades misses some steps, like Pesthunter Artifact to Relic.
  const parents = await readJson<Record<string, string[]>>(
    "constants/parents.json",
  );
  for (const [parent, children] of Object.entries(parents)) {
    const family = [parent, ...children].filter((id) => accessoryRanks.has(id));
    for (const id of family) {
      for (const upgrade of family) {
        if (accessoryRanks.get(upgrade)! > accessoryRanks.get(id)!) {
          supersede(id, upgrade);
        }
      }
    }
  }

  write("accessories.json", {
    ignored: [...new Set(misc.ignored_talisman.map(api))].toSorted(),
    upgrades: Object.fromEntries(
      [...upgrades].map(([id, ids]) => [id, [...ids].toSorted()]),
    ),
  });

  const bonuses = await readJson<{
    bonus_stats: Record<string, Record<string, Record<string, number>>>;
    pet_rewards: Record<string, { magic_find: number }>;
  }>("constants/bonuses.json");

  // A slayer level gives the stats of the highest bonus key at or under it.
  const toLevelStats = (
    table: Record<string, Record<string, number>>,
    levels: number,
  ) => {
    const stats: Record<string, number>[] = [];
    let current: Record<string, number> = {};
    for (let level = 1; level <= levels; level++) {
      if (table[level]) current = readNeuStats(table[level]);
      stats.push(current);
    }

    return stats;
  };

  write("stats.json", {
    base: readNeuStats(misc.base_stats),
    skills: Object.fromEntries(
      Object.entries(skills).map(([id, { levels }]) => [
        id.toLowerCase(),
        levels.map(({ unlocks = [] }) =>
          sumStatValues(
            unlocks.flatMap((line) =>
              parseStatRewards(normalizeItemText(line)),
            ),
          ),
        ),
      ]),
    ),
    slayers: Object.fromEntries(
      Object.entries(bonuses.bonus_stats)
        .filter(([id]) => id.startsWith("slayer_"))
        .map(([id, table]) => {
          const boss = id.slice("slayer_".length);
          return [boss, toLevelStats(table, slayerXp[boss].length)];
        }),
    ),
    pet_score: Object.fromEntries(
      Object.entries(bonuses.pet_rewards)
        .filter(([, { magic_find }]) => magic_find)
        .map(([score, { magic_find }]) => [score, magic_find]),
    ),
  });

  // The 200-level dragons' stats run from level 101 to 200.
  const petnums = await readJson<
    Record<
      string,
      Record<
        string,
        Record<string, { statNums: Record<string, number> }> & {
          stats_levelling_curve?: string;
        }
      >
    >
  >("constants/petnums.json");
  write(
    "petnums.json",
    Object.fromEntries(
      Object.entries(petnums).map(([type, rarities]) => [
        type,
        Object.fromEntries(
          Object.entries(rarities).map(
            ([
              rarity,
              { 1: first, 100: last, stats_levelling_curve: curve },
            ]) => [
              rarity,
              {
                first: readNeuStats(first.statNums),
                last: readNeuStats(last.statNums),
                levels: curve?.split(":").slice(0, 2).map(Number),
              },
            ],
          ),
        ),
      ]),
    ),
  );

  const minecraftData = async (file: "blocks" | "items") => {
    const url = `https://raw.githubusercontent.com/${MINECRAFT_DATA}/${MINECRAFT_DATA_SHA}/data/pc/1.8/${file}.json`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(SYNC_TIMEOUT),
    });
    if (!response.ok) throw new Error(`${url} answered ${response.status}`);
    return (await response.json()) as MinecraftItem[];
  };

  // Variants are keyed "<id>:<damage>", and damage 0 is also keyed "<id>".
  const [minecraftItems, minecraftBlocks] = await Promise.all([
    minecraftData("items"),
    minecraftData("blocks"),
  ]);
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

  // items.json repeats each block under its id, so the block's name wins.
  const blockIds = new Set(minecraftBlocks.map(({ id }) => id));
  const materials = Object.fromEntries([
    ...minecraftBlocks.map(({ id, name }) => [
      MATERIAL_NAMES.blocks[name] ?? name.toUpperCase(),
      id,
    ]),
    ...minecraftItems
      .filter(({ id }) => !blockIds.has(id))
      .map(({ id, name }) => [
        MATERIAL_NAMES.items[name] ?? name.toUpperCase(),
        id,
      ]),
  ]);

  write("textures-1.8.json", { materials, textures });

  write("source.json", {
    minecraftData: {
      repo: `https://github.com/${MINECRAFT_DATA}`,
      sha: MINECRAFT_DATA_SHA,
    },
    repo: `https://github.com/${REPO}`,
    sha,
    skills: { url: HYPIXEL_SKILLS, version: skillsVersion },
    collections: { url: HYPIXEL_COLLECTIONS, version: collectionsVersion },
    syncedAt: new Date().toISOString(),
  });

  // Each key is a Mongo path and a Redis key, so a changed one strands a board.
  const boardsFile = new URL(
    "../../schemas/src/skyblock/boards.json",
    import.meta.url,
  );
  const oldBoards = JSON.parse(await readFile(boardsFile, "utf8"));
  const newBoards = {
    collections: toBoardEntries(getCollectionBoards(collectionData)),
    bestiary: toBoardEntries(getBestiaryBoards(bestiaryData)),
  };
  checkBoards("collections", oldBoards.collections, newBoards.collections);
  checkBoards("bestiary", oldBoards.bestiary, newBoards.bestiary);
  await writeFile(boardsFile, `${JSON.stringify(newBoards, null, 2)}\n`);
  await Promise.all(
    Array.from(pending, ([file, text]) => writeFile(new URL(file, out), text)),
  );

  const license = await readFile(join(dir, "LICENSE"), "utf8");
  await writeFile(
    new URL("NOTICE.md", out),
    `textures-1.8.json takes 1.8's block and item ids, names and variants from minecraft-data (https://github.com/${MINECRAFT_DATA}) at ${MINECRAFT_DATA_SHA}, which its README licenses as MIT.\n\nThe skill XP tables in leveling.json and the skill stats in stats.json come from Hypixel's SkyBlock skills resource (${HYPIXEL_SKILLS}), version ${skillsVersion}. collections.json comes from Hypixel's SkyBlock collections resource (${HYPIXEL_COLLECTIONS}), version ${collectionsVersion}.\n\nThe other JSON files here, and the base, slayer and pet score tables in stats.json, are derived from NEU-REPO (https://github.com/${REPO}) at ${sha}, under its MIT license:\n\n${license}`,
  );

  console.log(
    `synced ${sha}: ${upgrades.size} upgradable accessories, ${Object.keys(petTextures).length} pet textures, ${Object.keys(skinTextures).length} pet skins, ${Object.keys(textures).length} item textures, ${Object.keys(materials).length} materials`,
  );
  console.log(`no texture in the 1.8 pack: ${unmapped.join(" ")}`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
