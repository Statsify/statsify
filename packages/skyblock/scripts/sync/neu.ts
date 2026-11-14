/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { KUUDRA_TIERS, type PlayerStat, type PowerStat, RARITIES, type StatValue } from "#types";
import { normalizeItemText, statNamed, statRewards } from "#lore";
import { add, roundTo } from "@statsify/math";
import { prettify, removeFormatting } from "@statsify/util";
import type { SyncContext } from "../sync-data.ts";
import { bestiaryBoards } from "@statsify/skyblock";
import { join } from "node:path";
import { legacyItem } from "@statsify/textures";
import { minecraftData } from "./textures.ts";
import { readdir } from "node:fs/promises";
import { skinHash } from "#textures";

export const NEU_REPO = "NotEnoughUpdates/NotEnoughUpdates-REPO";

/** Stat values summed by stat, rounded off the float noise of running totals, zeros left out. */
export const statTotals = (values: StatValue[]) => {
  const totals: Partial<Record<PlayerStat, number>> = {};
  for (const { stat, value } of values) totals[stat] = add(totals[stat] ?? 0, value);
  return Object.fromEntries(
    Object.entries(totals).flatMap(([stat, value]) => (value === 0 ? [] : [[stat, roundTo(value, 4)]]))
  );
};

/** NEU's stat ids (crit_damage, BONUS_ATTACK_SPEED) as stats; ids that aren't a player stat (damage) are left out. */
export const neuStats = (stats: Record<string, number>) =>
  statTotals(
    Object.entries(stats).flatMap(([id, value]) => {
      const stat = statNamed(prettify(id));
      return stat ? [{ stat, value }] : [];
    })
  );

/**
 * A perk's stats when its lore grants them outright, from its NEU expression. Perks that grant one "when mining
 * Gemstones" or "for the first 250 trees cut every day" don't count on the stat sheet.
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
 * A pet item's flat stats and its raises to the pet's stats, from NEU's lore. Sentences with a condition ("while mining
 * Titanium Ore", "for each of your Garden Levels") are left out.
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
  itemid: string; // its 1.8 material ("minecraft:skull"), or a newer item's id
  damage: number;
  displayname: string;
  lore?: string[];
  nbttag: string;
}

/**
 * An attribute's level I stats when its shard's lore grants them outright, one amount covering every stat listed after
 * it. A grant against some mobs, on some islands, while something holds or by a percent says more, so it gives none.
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

/** The texture hash in an item's SkullOwner, from its SNBT. */
const skullHash = (nbt: string) => {
  const value = /Value:"([\w+/=]+)"/.exec(nbt)?.[1];
  return value && skinHash(value);
};

/** Every generated table that comes from NEU-REPO alone. */
export const NEU_UNITS = {
  async sblevels({ readJson, write }: SyncContext) {
    const sblevels = await readJson<{ sblevel_colours: Record<string, string>; core_task: Record<string, unknown> }>(
      "constants/sblevels.json"
    );
    await write("sblevels.json", {
      core_task: {
        accessory_bag_xp: sblevels.core_task.accessory_bag_xp,
        pet_score_xp: sblevels.core_task.pet_score_xp,
      },
    });
  },

  async layouts({ readJson, write }: SyncContext) {
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
  },

  async hoppity({ readJson, write }: SyncContext) {
    const { hoppity } = await readJson<{ hoppity: { rarities: Record<string, { rabbits: string[] }> } }>("constants/hoppity.json");
    await write("hoppity.json", Object.fromEntries(Object.entries(hoppity.rarities).map(([rarity, { rabbits }]) => [rarity, rabbits])));
  },

  async bestiary({ readJson, write, setBoards }: SyncContext) {
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
      mobs.map(({ name: formatted, mobs: ids, cap, bracket, bracketType }) => {
        const name = removeFormatting(formatted);
        return {
          name,
          ids: [...ids, ...(missingIds[name] ?? [])],
          cap,
          bracket: bracketOf(name, cap, bracketType ? `${bracketType}_${bracket}` : String(bracket)),
        };
      });
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
    setBoards("bestiary", bestiaryBoards(bestiaryData));
  },

  async shards({ readJson, write }: SyncContext) {
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
  },

  async essenceshops({ readJson, write }: SyncContext) {
    // player_data.perks, which keeps the levels bought, calls NEU's eagle_advantage eagles_advantage
    const perkIds: Record<string, string> = { eagle_advantage: "eagles_advantage" };
    const shops = await readJson<Record<string, Record<string, { costs: number[] }>>>("constants/essenceshops.json");
    await write("essenceshops.json", {
      ...Object.fromEntries(
        Object.entries(shops).map(([shop, perks]) => [
          shop.replace("ESSENCE_", ""),
          Object.fromEntries(Object.entries(perks).map(([id, { costs }]) => [perkIds[id] ?? id, costs.length])),
        ])
      ),
      // NEU lacks the Rift's Sun Gecko shop: Blessing of Time's 3 tiers (the wiki's Sun Gecko essence shop page, an owner
      // exception, unverified)
      SUN_GECKO: { blessing_of_time: 3 },
    });
  },

  async garden({ readJson, write }: SyncContext) {
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
  },

  async items({ neu, readJson, write }: SyncContext) {
    // Accessory id → its tier's rank, and NEU's per-variant ids (an Abicase model, a party hat color) → the API's one id.
    const accessoryRanks = new Map<string, number>();
    const apiIds = new Map<string, string>();
    const petTextures: Record<string, Record<string, string>> = {};
    const petNames: Record<string, string> = {};
    const skinTextures: Record<string, string> = {};
    const skinColors: Record<string, string> = {};
    const powers: Record<string, { accessoryPower: number; stats: PowerStat[]; bonus: PowerStat[] }> = {};
    const kuudraKeys: Record<string, string> = {};
    const trophyFish = new Set(Object.keys(await readJson<Record<string, number[]>>("constants/trophyfish.json")));
    const trophyNames: Record<string, string> = {};
    const petItems: Record<string, NonNullable<ReturnType<typeof petItemEffect>>> = {};
    const itemModels: Record<string, string> = {};
    const materials = new Map((await minecraftData("items")).map(({ id, name }) => [`minecraft:${name}`, id]));
    const files = (await readdir(join(neu, "items"))).filter((file) => file.endsWith(".json"));
    const items = await Promise.all(files.map((file) => readJson<NeuItem>(join("items", file))));

    for (const item of items) {
      // The item_model a modern client draws, where it isn't the item its 1.8 material already is (a head's player_head)
      const model = /ItemModel:"([^"]+)"/.exec(item.nbttag)?.[1];
      const material = materials.get(item.itemid);
      const vanilla = material === undefined ? undefined : legacyItem(material, item.damage)?.id;
      if (model && model !== vanilla) itemModels[item.internalname] = model;

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

      // A skin's name takes its rarity's color, Ultimate (§4) included, and so does the ✦ after a pet that wears it
      const skin = item.internalname.startsWith("PET_SKIN_") && skullHash(item.nbttag);
      if (skin) skinTextures[item.internalname.slice("PET_SKIN_".length)] = skin;
      const skinColor = skin && /^§./.exec(item.displayname)?.[0];
      if (skinColor) skinColors[item.internalname.slice("PET_SKIN_".length)] = skinColor;

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

    await write("pet-textures.json", { pets: petTextures, skins: skinTextures, skinColors });
    await write("powers.json", powers);
    const keyless = KUUDRA_TIERS.filter((tier) => !kuudraKeys[tier]);
    if (keyless.length > 0) throw new Error(`no Kuudra key head for ${keyless.join(", ")}`);
    await write("kuudra-keys.json", kuudraKeys);
    await write("trophyfish.json", trophyNames);
    await write("pet-items.json", petItems);
    await write("item-models.json", itemModels);

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
    console.log(`${upgrades.size} upgradable accessories, ${Object.keys(petTextures).length} pet textures, ${Object.keys(skinTextures).length} pet skins`);
  },

  async petnums({ readJson, write }: SyncContext) {
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
  },

  // Every essence item at the pin, not the essence shops' types, which leave some out
  async essence({ neu, readJson, write }: SyncContext) {
    const files = (await readdir(join(neu, "items"))).filter((file) => /^ESSENCE_\w+\.json$/.test(file));
    const items = await Promise.all(files.map((file) => readJson<NeuItem>(join("items", file))));
    const headless = items.filter(({ nbttag }) => !skullHash(nbttag)).map(({ internalname }) => internalname);
    if (headless.length > 0) throw new Error(`no essence head for ${headless.join(", ")}`);
    await write("essence-textures.json", Object.fromEntries(items.map(({ internalname, nbttag }) => [internalname, skullHash(nbttag)])));
  },
};
