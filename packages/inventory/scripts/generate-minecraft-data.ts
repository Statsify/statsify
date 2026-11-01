/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Builds data/minecraft-data.json from minecraft-data at a pinned release, checked against a
// 26.3 client jar or vanilla pack zip so every name it writes is one the pack can draw:
//   pnpm --filter @statsify/inventory generate <path to 26.3.jar or pack zip>

import { readFile, writeFile } from "node:fs/promises";
import { unzipSync } from "fflate";

const MINECRAFT_DATA = "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/3.117.0/data/pc";

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${MINECRAFT_DATA}/${path}`);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json() as Promise<T>;
};

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

const path = process.argv[2];
if (!path) throw new Error("Pass the path to a 26.3 client jar or vanilla pack zip");

const names = { items: new Set<string>(), effects: new Set<string>() };

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

if (missing.length > 0) {
  throw new Error(`Not in ${path}, add them to RENAMES:\n${missing.join("\n")}`);
}

await writeFile(
  new URL("../data/minecraft-data.json", import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(
  `${Object.keys(output.items).length} items, ${Object.keys(output.durability).length} with durability, ${Object.keys(output.effects).length} effects`,
);
