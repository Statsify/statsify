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
import { KUUDRA_TIERS, type PowerStat, RARITIES } from "#types";
import { prettify, removeFormatting } from "@statsify/util";
import { skinHash } from "#textures";
import { tmpdir } from "node:os";
import { toLevelCosts } from "#leveling";

const REPO = "NotEnoughUpdates/NotEnoughUpdates-REPO";
const HYPIXEL_SKILLS = "https://api.hypixel.net/v2/resources/skyblock/skills";

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
  levels: { totalExpRequired: number }[];
}

interface NeuItem {
  internalname: string;
  displayname: string;
  lore?: string[];
  nbttag: string;
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
  const skillsResponse = await fetch(HYPIXEL_SKILLS);
  if (!skillsResponse.ok) throw new Error(`${HYPIXEL_SKILLS} answered ${skillsResponse.status}`);
  const { skills, version: skillsVersion } = (await skillsResponse.json()) as {
    skills: Record<string, HypixelSkill>;
    version: string;
  };
  const xpTable = (skill: string) => toLevelCosts(skills[skill].levels.map(({ totalExpRequired }) => totalExpRequired));

  const leveling = await readJson<Record<string, unknown>>("constants/leveling.json");
  const slayerXp = leveling.slayer_xp as Record<string, number[]>;
  const sblevels = await readJson<{ sblevel_colours: Record<string, string>; core_task: Record<string, unknown> }>(
    "constants/sblevels.json"
  );
  await write("leveling.json", {
    catacombs: leveling.catacombs,
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

  const hotm = await readJson<{ hotm: { perks: Record<string, Record<string, unknown>> } }>("constants/hotmlayout.json");
  await write(
    "hotmlayout.json",
    Object.fromEntries(
      Object.entries(hotm.hotm.perks).map(([id, { name, x, y, maxLevel }]) => [id, { name, x, y, maxLevel }])
    )
  );

  const hotf = await readJson<{ hotf: { perks: Record<string, { name: string; x: number; y: number; maxLevel: number }> } }>(
    "constants/hotflayout.json"
  );
  await write(
    "hotflayout.json",
    Object.fromEntries(Object.entries(hotf.hotf.perks).map(([id, { name, x, y, maxLevel }]) => [id, { name, x, y, maxLevel }]))
  );

  const { hoppity } = await readJson<{ hoppity: { rarities: Record<string, { rabbits: string[] }> } }>("constants/hoppity.json");
  await write("hoppity.json", Object.fromEntries(Object.entries(hoppity.rarities).map(([rarity, { rabbits }]) => [rarity, rabbits])));

  const bestiary = await readJson<{ fishing: Record<string, { mobs?: { name: string; mobs: string[] }[] }> }>(
    "constants/bestiary.json"
  );
  await write(
    "sea-creatures.json",
    Object.values(bestiary.fishing).flatMap((page) => page.mobs?.map(({ name, mobs }) => ({ name: removeFormatting(name), ids: mobs })) ?? [])
  );

  // player_data.perks, which keeps the levels bought, calls NEU's eagle_advantage eagles_advantage
  const perkIds: Record<string, string> = { eagle_advantage: "eagles_advantage" };
  const shops = await readJson<Record<string, Record<string, { costs: number[] }>>>("constants/essenceshops.json");
  await write(
    "essenceshops.json",
    Object.fromEntries(
      Object.entries(shops).map(([shop, perks]) => [
        shop.replace("ESSENCE_", ""),
        Object.fromEntries(Object.entries(perks).map(([id, { costs }]) => [perkIds[id] ?? id, costs.length])),
      ])
    )
  );

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

  const misc = await readJson<{ ignored_talisman: string[]; talisman_upgrades: Record<string, string[]> }>(
    "constants/misc.json"
  );
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
    syncedAt: new Date().toISOString(),
  });
  const license = await readFile(join(dir, "LICENSE"), "utf8");
  await writeFile(
    new URL("NOTICE.md", out),
    `textures-1.8.json takes 1.8's block and item ids, names and variants from minecraft-data (https://github.com/${MINECRAFT_DATA}) at ${MINECRAFT_DATA_SHA}, which its README licenses as MIT.\n\nThe skill XP tables in leveling.json come from Hypixel's SkyBlock skills resource (${HYPIXEL_SKILLS}), version ${skillsVersion}.\n\nThe other JSON files here are derived from NEU-REPO (https://github.com/${REPO}) at ${sha}, under its MIT license:\n\n${license}`
  );

  console.log(
    `synced ${sha}: ${upgrades.size} upgradable accessories, ${Object.keys(petTextures).length} pet textures, ${Object.keys(skinTextures).length} pet skins, ${Object.keys(textures).length} item textures, ${Object.keys(materials).length} materials`
  );
  console.log(`no texture in the 1.8 pack: ${unmapped.join(" ")}`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
