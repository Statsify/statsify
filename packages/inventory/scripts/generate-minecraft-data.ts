/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { readFile, writeFile } from "node:fs/promises";
import { fetchJson } from "./minecraft-data.ts";
import { unzipSync } from "fflate";

// Bukkit's 1.8 Material enum (from a Spigot 1.8 source mirror), since SkyWars' kit layouts name
// items by it, like GOLD_CHESTPLATE or MONSTER_EGG
const BUKKIT_MATERIALS =
  "https://raw.githubusercontent.com/Attano/Spigot-1.8/9db48bc15e203179554b8d992ca6b0a528c8d300/org/bukkit/Material.java";

// minecraft-data's 1.13 names that 26.3 renamed (stone_slab still exists but names another block,
// so the pack check can't catch it). null drops eggs for entity types that never had one
const RENAMES: Record<string, string | null> = {
  grass: "short_grass",
  sign: "oak_sign",
  stone_slab: "smooth_stone_slab",
  rose_red: "red_dye",
  cactus_green: "green_dye",
  dandelion_yellow: "yellow_dye",
  zombie_pigman_spawn_egg: "zombified_piglin_spawn_egg",
  grass_path: "dirt_path",
  mob_spawn_egg: null,
  monster_spawn_egg: null,
  giant_spawn_egg: null,
};

// 1.8's dye items by colour, with silver as 1.8's name for light gray
const DYES: Record<string, string> = {
  white: "bone_meal",
  orange: "orange_dye",
  magenta: "magenta_dye",
  light_blue: "light_blue_dye",
  yellow: "yellow_dye",
  lime: "lime_dye",
  pink: "pink_dye",
  gray: "gray_dye",
  silver: "light_gray_dye",
  cyan: "cyan_dye",
  purple: "purple_dye",
  blue: "lapis_lazuli",
  brown: "cocoa_beans",
  green: "green_dye",
  red: "red_dye",
  black: "ink_sac",
};

const RECORDS = ["11", "13", "blocks", "cat", "chirp", "far", "mall", "mellohi", "stal", "strad", "wait", "ward"] as const;

/** A texture's 26.3 name, null where 26.3 draws it another way, or one frame of a 1.8 strip, by how far along it sits */
type LegacyTexture = string | null | { texture: string; position: number };

// 1.8.9 textures whose models were renamed too, so no same-named model pairs them with 26.3's
const LEGACY_TEXTURES: Record<string, LegacyTexture> = {
  ...Object.fromEntries(
    Object.entries(DYES).flatMap(([color, dye]) => [
      [`blocks/hardened_clay_stained_${color}`, `block/${color === "silver" ? "light_gray" : color}_terracotta`],
      [`items/dye_powder_${color}`, `item/${dye}`],
    ]),
  ),
  ...Object.fromEntries(RECORDS.map((record) => [`items/record_${record}`, `item/music_disc_${record}`])),
  "blocks/anvil_base": "block/anvil",
  "blocks/anvil_top_damaged_0": "block/anvil_top",
  "blocks/anvil_top_damaged_1": "block/chipped_anvil_top",
  "blocks/anvil_top_damaged_2": "block/damaged_anvil_top",
  "blocks/double_plant_fern_top": "block/large_fern_top",
  "blocks/double_plant_grass_top": "block/tall_grass_top",
  "blocks/double_plant_paeonia_top": "block/peony_top",
  "blocks/double_plant_rose_top": "block/rose_bush_top",
  "blocks/double_plant_syringa_top": "block/lilac_top",
  "blocks/farmland_dry": "block/farmland",
  "blocks/flower_houstonia": "block/azure_bluet",
  "blocks/glass_silver": "block/light_gray_stained_glass",
  "blocks/grass_side": "block/grass_block_side",
  "blocks/grass_side_overlay": "block/grass_block_side_overlay",
  "blocks/grass_top": "block/grass_block_top",
  "blocks/hardened_clay": "block/terracotta",
  "blocks/mob_spawner": "block/spawner",
  "blocks/mushroom_block_skin_brown": "block/brown_mushroom_block",
  "blocks/mushroom_block_skin_red": "block/red_mushroom_block",
  "blocks/noteblock": "block/note_block",
  "blocks/pumpkin_face_off": "block/carved_pumpkin",
  "blocks/prismarine_dark": "block/dark_prismarine",
  "blocks/prismarine_rough": "block/prismarine",
  "blocks/pumpkin_face_on": "block/jack_o_lantern",
  "blocks/quartz_block_chiseled": "block/chiseled_quartz_block",
  "blocks/quartz_block_chiseled_top": "block/chiseled_quartz_block_top",
  "blocks/quartz_block_lines": "block/quartz_pillar_side",
  "blocks/quartz_block_lines_top": "block/quartz_pillar_top",
  "blocks/quartz_ore": "block/nether_quartz_ore",
  "blocks/rail_golden": "block/powered_rail",
  "blocks/red_sandstone_carved": "block/chiseled_red_sandstone",
  "blocks/red_sandstone_smooth": "block/cut_red_sandstone",
  "blocks/redstone_lamp_off": "block/redstone_lamp",
  "blocks/sandstone_carved": "block/chiseled_sandstone",
  "blocks/sandstone_smooth": "block/cut_sandstone",
  "blocks/slime": "block/slime_block",
  "blocks/sponge_wet": "block/wet_sponge",
  "blocks/stone_andesite_smooth": "block/polished_andesite",
  "blocks/stone_diorite_smooth": "block/polished_diorite",
  "blocks/stone_granite_smooth": "block/polished_granite",
  "blocks/stone_slab_side": "block/smooth_stone_slab_side",
  "blocks/stonebrick_carved": "block/chiseled_stone_bricks",
  "blocks/stonebrick_cracked": "block/cracked_stone_bricks",
  "blocks/stonebrick_mossy": "block/mossy_stone_bricks",
  "blocks/tallgrass": "block/short_grass",
  "blocks/trapdoor": "block/oak_trapdoor",
  "blocks/waterlily": "block/lily_pad",
  "blocks/web": "block/cobweb",
  "blocks/wool_colored_silver": "block/light_gray_wool",
  "entity/steve": "entity/player/wide/steve",
  "items/boat": "item/oak_boat",
  "items/fireworks": "item/firework_rocket",
  "items/fireworks_charge": "item/firework_star",
  "items/fireworks_charge_overlay": "item/firework_star_overlay",
  "items/fish_clownfish_raw": "item/tropical_fish",
  "items/melon": "item/melon_slice",
  "items/melon_speckled": "item/glistering_melon_slice",
  "items/netherbrick": "item/nether_brick",
  "items/potion_bottle_drinkable": "item/potion",
  "items/potion_bottle_splash": "item/splash_potion",
  "items/reeds": "item/sugar_cane",
  "items/sign": "item/oak_sign",
  // 1.8 animated these strips in code; a slot shows 26.3's first entry, frame 0 of 64 and 16 of 32.
  // Packs replace them with strips of any length, so the frame is kept as a point along the strip
  "items/clock": { texture: "item/clock_00", position: 0 },
  "items/compass": { texture: "item/compass_16", position: 0.5 },
  // 26.3 draws beds in code, and gives each spawn egg its own texture where 1.8 tinted one
  "items/bed": null,
  "items/spawn_egg": null,
  "items/spawn_egg_overlay": null,
};

interface LegacyItem {
  id: number;
  name: string;
  variations?: { metadata: number }[];
}

interface LegacyEntity {
  id: number;
  displayName: string;
  type: string;
}

interface ModernItem {
  name: string;
  maxDurability?: number;
}

const snakeCase = (name: string) =>
  name
    .replaceAll(/([a-z])([A-Z])/g, "$1_$2")
    .replaceAll(" ", "_")
    .toLowerCase();

const [path, legacyPath, namesPath] = process.argv.slice(2);
if (!path || !legacyPath || !namesPath) {
  throw new Error("Pass the paths to a 26.3 client jar or vanilla pack zip, a 1.8.9 client jar and a /sdump names export");
}

const names = { items: new Set<string>(), effects: new Set<string>() };

interface ModelFile {
  parent?: string;
  textures?: Record<string, string | { sprite: string }>;
  elements?: { faces: Record<string, { texture: string }> }[];
}

const MODEL = /^assets\/minecraft\/models\/((?:item|block)\/.+)\.json$/;
const TEXTURE = /^assets\/minecraft\/textures\/(.+)\.png$/;

async function readAssets(source: string) {
  const textures = new Set<string>();

  const files = unzipSync(await readFile(source), {
    filter: ({ name }) => {
      const texture = TEXTURE.exec(name);
      if (texture) textures.add(texture[1]);
      return MODEL.test(name);
    },
  });

  const decoder = new TextDecoder();
  const models = new Map<string, ModelFile>();

  for (const [name, file] of Object.entries(files)) {
    models.set(MODEL.exec(name)![1], JSON.parse(decoder.decode(file)));
  }

  return { models, textures };
}

const stripNamespace = (id: string) => id.replace("minecraft:", "");

/** A model's textures with its parents' merged in and #references followed */
function modelTextures(models: Map<string, ModelFile>, id: string) {
  const merged: Record<string, string> = {};
  const chain: ModelFile[] = [];

  for (let next: string | undefined = id; next && models.has(next); ) {
    const model: ModelFile = models.get(next)!;
    chain.push(model);
    next = model.parent && stripNamespace(model.parent);
  }

  for (const model of chain.toReversed()) {
    for (const [key, value] of Object.entries(model.textures ?? {})) {
      merged[key] = stripNamespace(typeof value === "string" ? value : value.sprite);
    }
  }

  const resolved: Record<string, string> = {};

  for (const key of Object.keys(merged)) {
    let value: string | undefined = merged[key];
    while (value?.startsWith("#")) value = merged[value.slice(1)];
    if (value && !value.startsWith("#")) resolved[key] = value;
  }

  return resolved;
}

unzipSync(await readFile(path), {
  filter: ({ name }) => {
    const item = /^assets\/minecraft\/items\/(.+)\.json$/.exec(name);
    if (item) names.items.add(item[1]);

    const effect = /^assets\/minecraft\/textures\/mob_effect\/(.+)\.png$/.exec(name);
    if (effect) names.effects.add(effect[1]);

    return false;
  },
});

if (names.items.size === 0) throw new Error(`${path} has no assets/minecraft/items folder`);

const [modernAssets, legacyAssets] = await Promise.all([readAssets(path), readAssets(legacyPath)]);
if (!legacyAssets.textures.has("items/diamond_sword")) throw new Error(`${legacyPath} isn't a 1.8.9 client jar`);

const [legacy, items, entities, effects, modernItems] = await Promise.all([
  fetchJson<{ items: Record<string, string | null> }>("common/legacy.json"),
  fetchJson<LegacyItem[]>("1.8/items.json"),
  fetchJson<LegacyEntity[]>("1.8/entities.json"),
  fetchJson<{ id: number; name: string }[]>("1.8/effects.json"),
  fetchJson<ModernItem[]>("26.1/items.json"),
]);

const missing: string[] = [];

const modernName = (key: string, name: string) => {
  const renamed = name in RENAMES ? RENAMES[name] : name;
  if (renamed === null) return;
  if (names.items.has(renamed)) return renamed;
  missing.push(`${key} ${name}`);
  return undefined;
};

const output = {
  items: {} as Record<string, string>,
  durability: {} as Record<string, number>,
  effects: {} as Record<string, string>,
  materials: {} as Record<string, number>,
  legacyTextures: {} as Record<string, LegacyTexture>,
  legacyModels: {} as Record<string, string>,
  legacyNames: {} as Record<string, string>,
};

const SPAWN_EGG = 383;
const POTION = 373;

const mobs = new Map(
  entities.filter((entity) => entity.type === "mob").map((entity) => [entity.id, entity]),
);

// The legacy table has every id:damage pair an item had, so an id with only :0 is keyed by
// its id alone, and any Damage on it (tool wear) still finds it
const variants = Map.groupBy(
  Object.entries(legacy.items).map(([key, name]) => {
    const [id, damage] = key.split(":").map(Number);
    return { id, damage, name };
  }),
  ({ id }) => id,
);

for (const [id, entries] of variants) {
  if (id === 0) continue;

  // Potions take their effects from the Damage value at runtime, see legacy-items.ts
  if (id === POTION) continue;

  for (const { damage, name } of entries) {
    if (!name) continue;

    const key = entries.length === 1 ? `${id}` : `${id}:${damage}`;
    const modern = modernName(key, name.replace("minecraft:", ""));
    if (modern) output.items[key] = modern;
  }
}

// The legacy table has no spawn eggs, whose Damage is the mob's entity id
const eggs = items.find(({ id }) => id === SPAWN_EGG)?.variations ?? [];

for (const { metadata } of eggs) {
  const mob = mobs.get(metadata);
  if (!mob) continue;

  const key = `${SPAWN_EGG}:${metadata}`;
  const name = modernName(key, `${snakeCase(mob.displayName)}_spawn_egg`);
  if (name) output.items[key] = name;
}

interface DumpedName {
  id: number;
  damage: number;
  name: string;
  rarity: string;
}

const dumpedNames: DumpedName[] = JSON.parse(await readFile(namesPath, "utf8")).items;

for (const { id, damage, name, rarity } of dumpedNames) {
  const modern = output.items[`${id}:${damage}`] ?? (damage === 0 ? output.items[id] : undefined);
  if (modern) output.legacyNames[modern] = `${rarity}${name}`;
}

const mapped = new Set(Object.values(output.items));

for (const item of modernItems) {
  if (item.maxDurability && mapped.has(item.name)) {
    output.durability[item.name] = item.maxDurability;
  }
}

for (const effect of effects) {
  const name = snakeCase(effect.name);
  if (names.effects.has(name)) output.effects[effect.id] = name;
  else missing.push(`effect ${effect.id} ${name}`);
}

const materials = await fetch(BUKKIT_MATERIALS);
if (!materials.ok) throw new Error(`Material.java: ${materials.status}`);

// Entries look like GOLD_CHESTPLATE(315, 1, 112). Only ids the item table has are kept
const drawn = new Set([POTION, ...Object.keys(output.items).map((key) => Number(key.split(":")[0]))]);

for (const [, name, id] of (await materials.text()).matchAll(/^\s+([A-Z0-9_]+)\((\d+)/gm)) {
  if (drawn.has(Number(id))) output.materials[name] = Number(id);
}

// 1.8's command block texture has several 26.3 counterparts; the most common pairing wins
const pairings = new Map<string, Map<string, number>>();

for (const id of legacyAssets.models.keys()) {
  if (!modernAssets.models.has(id)) continue;

  const after = modelTextures(modernAssets.models, id);

  for (const [key, texture] of Object.entries(modelTextures(legacyAssets.models, id))) {
    const target = after[key];
    if (!target || !legacyAssets.textures.has(texture) || !modernAssets.textures.has(target)) continue;

    const counts = pairings.get(texture) ?? new Map<string, number>();
    counts.set(target, (counts.get(target) ?? 0) + 1);
    pairings.set(texture, counts);
  }
}

const mostPaired = (counts: Map<string, number>) =>
  [...counts].toSorted(([a, x], [b, y]) => y - x || a.localeCompare(b))[0][0];

const sameName = (texture: string) => texture.replace(/^items\//, "item/").replace(/^blocks\//, "block/");

const itemTextures = new Set(
  [...legacyAssets.models.keys()]
    .filter((id) => id.startsWith("item/"))
    .flatMap((id) => Object.values(modelTextures(legacyAssets.models, id))),
);

for (const texture of [...legacyAssets.textures].toSorted()) {
  const paired = pairings.get(texture);
  const target =
    texture in LEGACY_TEXTURES
      ? LEGACY_TEXTURES[texture]
      : modernAssets.textures.has(sameName(texture))
        ? sameName(texture)
        : paired && mostPaired(paired);

  if (target === undefined) {
    if (itemTextures.has(texture)) missing.push(`texture ${texture}`);
  } else if (target !== null && !modernAssets.textures.has(typeof target === "string" ? target : target.texture)) {
    missing.push(`texture ${texture} as ${JSON.stringify(target)}`);
  } else if (target !== texture) {
    output.legacyTextures[texture] = target;
  }
}

const renamedTexture = (texture: string) => {
  const target = texture in output.legacyTextures ? output.legacyTextures[texture] : texture;
  return typeof target === "string" ? target : target?.texture;
};

/** Whether a model's elements use a texture variable it never sets, as a parent template does */
function isTemplate(models: Map<string, ModelFile>, id: string) {
  const textures = modelTextures(models, id);
  let elements: ModelFile["elements"];

  for (let next: string | undefined = id; next && models.has(next) && !elements; ) {
    const model: ModelFile = models.get(next)!;
    elements = model.elements;
    next = model.parent && stripNamespace(model.parent);
  }

  return (elements ?? []).some((element) =>
    Object.values(element.faces).some(({ texture }) => texture.startsWith("#") && !(texture.slice(1) in textures)),
  );
}

// A 1.8.9 model whose name 26.3 gives another role (1.8's block/anvil is its damage levels'
// template, 26.3's is the anvil) moves aside, so it doesn't replace 26.3's, and its children follow it
const moved = new Set(
  [...legacyAssets.models.keys()].filter(
    (id) => modernAssets.models.has(id) && isTemplate(legacyAssets.models, id) !== isTemplate(modernAssets.models, id),
  ),
);

for (const id of moved) output.legacyModels[id] = `legacy/${id}`;

const modelNames = Map.groupBy(
  [...legacyAssets.models.keys()]
    .filter((id) => !modernAssets.models.has(id))
    .flatMap((id) => {
      const name = Object.values(modelTextures(legacyAssets.models, id))
        .map(renamedTexture)
        .find(
          (texture) =>
            texture?.startsWith(id.slice(0, id.indexOf("/") + 1)) &&
            modernAssets.models.has(texture) &&
            (!legacyAssets.models.has(texture) || moved.has(texture)),
        );

      return name ? [{ id, name }] : [];
    }),
  ({ name }) => name,
);

for (const [name, models] of modelNames) {
  if (models.length === 1) output.legacyModels[models[0].id] = name;
}

// Flat items whose frame 1.8 picked in code, which the pinned strip frames above stand in for
output.legacyModels["builtin/clock"] = "builtin/generated";
output.legacyModels["builtin/compass"] = "builtin/generated";

// Block items draw 1.8.9's item model of the same name, and these 1.8 names are other 26.3 items:
// 1.8's snow is the block, its stone slab and stairs are smooth stone and cobblestone's
Object.assign(output.legacyModels, {
  "item/smooth_red_sandstone": "item/cut_red_sandstone",
  "item/smooth_sandstone": "item/cut_sandstone",
  "item/snow": "item/snow_block",
  "item/stone_slab": "item/smooth_stone_slab",
  "item/stone_stairs": "item/cobblestone_stairs",
});

if (missing.length > 0) {
  throw new Error(`Not in ${path}, add them to RENAMES or LEGACY_TEXTURES:\n${missing.join("\n")}`);
}

await writeFile(
  new URL("../data/minecraft-data.json", import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(
  `${Object.keys(output.items).length} items, ${Object.keys(output.durability).length} with durability, ${Object.keys(output.effects).length} effects, ${Object.keys(output.materials).length} Bukkit materials, ${Object.keys(output.legacyTextures).length} 1.8.9 textures and ${Object.keys(output.legacyModels).length} models renamed, ${Object.keys(output.legacyNames).length} 1.8.9 names`,
);
