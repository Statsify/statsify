/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  KUUDRA_TIERS,
  PET_SKIN_PREFIX,
  RARITIES,
  type PlayerStat,
  type PowerStat,
  type StatValue,
} from "#types";
import { add, roundTo } from "@statsify/math";
import { normalizeItemText, parseStatName, parseStatRewards } from "#lore";
import { prettify, removeFormatting } from "@statsify/util";
import { fetchMinecraftData, fetchOk } from "./textures.ts";
import { getBestiaryBoards } from "@statsify/skyblock";
import { join } from "node:path";
import { legacyItem } from "@statsify/textures";
import { readdir } from "node:fs/promises";
import { skinHash } from "#textures";
import type { SyncContext } from "../sync-data.ts";

export const NEU_REPO = "NotEnoughUpdates/NotEnoughUpdates-REPO";

// The last commit before NEU-REPO removed sblevels.json and the base stats.
export const NEU_BEFORE_REMOVAL = "5a5e9866a8578c8a36891acc508fc1e46e41eb31";

export async function fetchNeuBeforeRemoval<T>(path: string) {
  const response = await fetchOk(
    `https://raw.githubusercontent.com/${NEU_REPO}/${NEU_BEFORE_REMOVAL}/${path}`,
  );
  return (await response.json()) as T;
}

// Rounding to 4 places drops the float noise of running totals.
export function sumStatValues(values: StatValue[]) {
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
export function readNeuStats(stats: Record<string, number>) {
  const values: StatValue[] = [];
  for (const [id, value] of Object.entries(stats)) {
    const stat = parseStatName(prettify(id));
    if (stat) values.push({ stat, value });
  }

  return sumStatValues(values);
}

// No pet has base Magic Find since 0.27.3, though NEU still lists two.
const readPetBaseStats = (statNums: Record<string, number>) =>
  Object.fromEntries(
    Object.entries(readNeuStats(statNums)).filter(
      ([stat]) => stat !== "magic_find",
    ),
  );

interface NeuPerk {
  name: string;
  x: number;
  y: number;
  maxLevel: number;
  stat?: string;
  lore?: unknown[];
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
  const condition = /\b(?:when|while|for each|for every|per|against|mobs)\b/;

  const flat: StatValue[] = [];
  for (const sentence of sentences) {
    if (!sentence.startsWith("Grants ") || condition.test(sentence)) continue;

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
  itemid: string; // its 1.8 material, like minecraft:skull, or a newer id
  damage: number;
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

// NEU's families leave out these kill ids, which the saves have.
const MISSING_KILL_IDS: Record<string, string[]> = {
  "Cretan Bull": ["cretan_bull_95"],
  "Emerald Slime": ["emerald_slime_15"],
  "Minos Hunter": ["minos_hunter_80"],
  "Stranded Nymph": ["stranded_nymph_95"],
};

function getBestiaryBrackets({ brackets, bracketSets }: NeuBestiary) {
  const all: Record<string, number[]> = { ...brackets };
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
      const given = bracketType ? `${bracketType}_${bracket}` : String(bracket);
      return {
        name,
        ids: [...ids, ...(MISSING_KILL_IDS[name] ?? [])],
        cap,
        bracket: getFamilyBracket(brackets, { name, cap }, given),
      };
    },
  );
}

const isBestiaryPage = (value: unknown): value is NeuBestiaryPage =>
  typeof value === "object" && value !== null && "mobs" in value;

// The Fishing and Critter Safari pages list their subpages under a category.
async function readBestiary(readJson: SyncContext["readJson"]) {
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
async function readAttributeShards(readJson: SyncContext["readJson"]) {
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

// NEU keys milestones by crop name, but the Garden uses collection ids.
const GARDEN_CROPS: Record<string, string> = {
  CARROT: "CARROT_ITEM",
  COCOA_BEANS: "INK_SACK:3",
  MUSHROOM: "MUSHROOM_COLLECTION",
  NETHER_WART: "NETHER_STALK",
  POTATO: "POTATO_ITEM",
  SUNFLOWER: "DOUBLE_PLANT",
};

const WHEAT_TIERS = { 21: 325_000, 23: 500_000 };

const CANE_TIERS = { 21: 650_000, 23: 1_000_000 };

const COCOA_TIERS = {
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

// The wiki's Garden pages fix NEU's milestones, by tier.
const MILESTONE_FIXES: Record<string, Record<number, number>> = {
  WHEAT: WHEAT_TIERS,
  PUMPKIN: WHEAT_TIERS,
  MUSHROOM: WHEAT_TIERS,
  SUNFLOWER: WHEAT_TIERS,
  MOONFLOWER: WHEAT_TIERS,
  SUGAR_CANE: CANE_TIERS,
  CACTUS: CANE_TIERS,
  WILD_ROSE: CANE_TIERS,
  COCOA_BEANS: COCOA_TIERS,
  NETHER_WART: COCOA_TIERS,
  MELON: {
    5: 1800,
    20: 1_200_000,
    21: 1_600_000,
    23: 2_500_000,
    24: 3_200_000,
  },
};

export const NEU_UNITS = {
  async sblevels({ write }: SyncContext) {
    const { core_task } = await fetchNeuBeforeRemoval<{
      core_task: Record<string, unknown>;
    }>("constants/sblevels.json");
    write("sblevels.json", {
      core_task: {
        accessory_bag_xp: core_task.accessory_bag_xp,
        pet_score_xp: core_task.pet_score_xp,
      },
    });
  },

  async layouts({ readJson, write }: SyncContext) {
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
  },

  async hoppity({ readJson, write }: SyncContext) {
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
  },

  async bestiary({ readJson, write, setBoards }: SyncContext) {
    const bestiary = await readBestiary(readJson);
    write("bestiary.json", bestiary);
    setBoards("bestiary", getBestiaryBoards(bestiary));
  },

  async shards({ readJson, write }: SyncContext) {
    write("attribute-shards.json", await readAttributeShards(readJson));
  },

  async essenceshops({ readJson, write }: SyncContext) {
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
  },

  async garden({ readJson, write }: SyncContext) {
    const garden = await readJson<{
      garden_exp: number[];
      crop_milestones: Record<string, number[]>;
      visitors: Record<string, string>;
      plots: Record<string, unknown>;
      crop_upgrades: number[];
      composter_upgrades: Record<string, Record<string, unknown>>;
    }>("constants/garden.json");
    write("garden.json", {
      garden_exp: garden.garden_exp,
      crop_milestones: Object.fromEntries(
        Object.entries(garden.crop_milestones).map(([crop, tiers]) => [
          GARDEN_CROPS[crop] ?? crop,
          tiers.map((amount, i) => MILESTONE_FIXES[crop]?.[i + 1] ?? amount),
        ]),
      ),
      // The wiki gives these two visitors a rarity NEU doesn't.
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
  },

  async items({ neu, readJson, write }: SyncContext) {
    const accessoryRanks = new Map<string, number>();
    // NEU gives each Abicase model and party hat color its own id.
    const apiIds = new Map<string, string>();
    const petTextures: Record<string, Record<string, string>> = {};
    const petNames: Record<string, string> = {};
    const skinTextures: Record<string, string> = {};
    const skinColors: Record<string, string> = {};
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
    const essenceTextures: Record<string, string> = {};
    const headlessEssence: string[] = [];
    const itemModels: Record<string, string> = {};
    const [minecraftItems, names] = await Promise.all([
      fetchMinecraftData("items"),
      readdir(join(neu, "items")),
    ]);
    const materials = new Map(
      minecraftItems.map(({ id, name }) => [`minecraft:${name}`, id]),
    );
    const files = names.filter((file) => file.endsWith(".json"));
    const items = await Promise.all(
      files.map((file) => readJson<NeuItem>(join("items", file))),
    );

    for (const item of items) {
      // Keep a model only where it isn't what its 1.8 material already draws.
      const model = /ItemModel:"([^"]+)"/.exec(item.nbttag)?.[1];
      const material = materials.get(item.itemid);
      const vanilla =
        material === undefined
          ? undefined
          : legacyItem(material, item.damage)?.id;
      if (model && model !== vanilla) itemModels[item.internalname] = model;

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

      const skinId = item.internalname.startsWith(PET_SKIN_PREFIX)
        ? item.internalname.slice(PET_SKIN_PREFIX.length)
        : undefined;
      const skin = skinId && skullHash(item.nbttag);
      if (skinId && skin) {
        skinTextures[skinId] = skin;
        // A skin's name has its rarity's color, which its pet's ✦ takes too.
        const color = /^§./.exec(item.displayname)?.[0];
        if (color) skinColors[skinId] = color;
      }

      // For example "§a§lUNCOMMON PET ITEM".
      const rarityLine = removeFormatting(item.lore?.at(-1) ?? "");
      const petItem =
        rarityLine.endsWith("PET ITEM") && readPetItem(item.lore ?? []);
      if (petItem) petItems[item.internalname] = petItem;

      // The essence shops leave some essence types out, so the items list them.
      if (/^ESSENCE_\w+$/.test(item.internalname)) {
        const essence = skullHash(item.nbttag);
        if (essence) essenceTextures[item.internalname] = essence;
        else headlessEssence.push(item.internalname);
      }

      // For example "§9§lRARE DUNGEON ACCESSORY" or "§5§lEPIC HATCESSORY".
      const kind = /^(.+?)(?: DUNGEON)? (?:ACCESSORY|HATCESSORY)$/.exec(
        removeFormatting(item.lore?.at(-1) ?? "").trim(),
      );
      if (!kind) continue;

      accessoryRanks.set(
        item.internalname,
        RARITIES.findIndex((rarity) => rarity === kind[1].replaceAll(" ", "_")),
      );
      const variant =
        /(?:model|party_hat_color|party_hat_emoji):"([^"]+)"/.exec(
          item.nbttag,
        )?.[1];
      if (variant) {
        apiIds.set(
          item.internalname,
          item.internalname.replace(`_${variant.toUpperCase()}`, ""),
        );
      }
    }

    write("pet-textures.json", {
      pets: petTextures,
      skins: skinTextures,
      skinColors,
    });

    const stones = items
      .map((item) => readPowerStone(item.lore ?? []))
      .filter((stone) => stone !== undefined);
    write("powers.json", Object.fromEntries(stones));

    const keyless = KUUDRA_TIERS.filter((tier) => !kuudraKeys[tier]);
    if (keyless.length > 0) {
      throw new Error(`no Kuudra key head for ${keyless.join(", ")}`);
    }

    if (headlessEssence.length > 0) {
      throw new Error(`no essence head for ${headlessEssence.join(", ")}`);
    }

    write("kuudra-keys.json", kuudraKeys);
    write("trophyfish.json", trophyNames);
    write("pet-items.json", petItems);
    write("item-models.json", itemModels);
    write("essence-textures.json", essenceTextures);

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
      // NEU still lists the anniversary hats, which are helmets since 0.27.3.
      if (!accessoryRanks.has(id) || !accessoryRanks.has(upgrade)) return;
      if (api(id) === api(upgrade)) return;
      // NEU lists a few lower tiers as upgrades, like Powder of the Many.
      if (accessoryRanks.get(upgrade)! < accessoryRanks.get(id)!) return;

      const known = upgrades.get(api(id)) ?? new Set();
      upgrades.set(api(id), known.add(api(upgrade)));
    };

    const [misc, parents] = await Promise.all([
      readJson<{
        ignored_talisman: string[];
        talisman_upgrades: Record<string, string[]>;
      }>("constants/misc.json"),
      readJson<Record<string, string[]>>("constants/parents.json"),
    ]);
    for (const [id, list] of Object.entries(misc.talisman_upgrades)) {
      for (const upgrade of list) supersede(id, upgrade);
    }

    // talisman_upgrades misses some steps, like Pesthunter Artifact to Relic.
    for (const [parent, children] of Object.entries(parents)) {
      const family = [parent, ...children].filter((id) =>
        accessoryRanks.has(id),
      );
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

    console.log(
      `${upgrades.size} upgradable accessories, ${Object.keys(petTextures).length} pet textures, ${Object.keys(skinTextures).length} pet skins`,
    );
  },

  async petnums({ readJson, write }: SyncContext) {
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
                  first: readPetBaseStats(first.statNums),
                  last: readPetBaseStats(last.statNums),
                  levels: curve?.split(":").slice(0, 2).map(Number),
                },
              ],
            ),
          ),
        ]),
      ),
    );
  },
};
