/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// node scripts/import-dump.ts <each dump session's last export>…

import {
  ARMOR,
  type KartPart,
  type Kit,
  type KitItem,
  type LegacyKit,
  type SkyWarsKit,
  type TntGamesMode,
  isUntypedEgg,
  kitKey,
  leatherColor,
  skinUrl,
} from "@statsify/hypixel-data";
import {
  type ItemStack,
  fetchMinecraftData,
  legacyItem,
  legacyMaterialId,
  namespaced,
  withoutNamespace,
} from "@statsify/textures";
import { readFile, writeFile } from "node:fs/promises";
import { removeFormatting } from "@statsify/util";
import data from "@statsify/textures/data/minecraft-data.json" with { type: "json" };

// Tokens drop copy numbers (wood_1 is wood), by their default layout slot
const SINGLE_KIT_EDITORS = {
  "UHC Duel": {
    mode: "uhc_duel",
    tokens: {
      diamond_sword: 0,
      fishing_rod: 1,
      bow: 2,
      diamond_axe: 3,
      golden_apple: 4,
      golden_head: 5,
      lava_bucket: 6,
      water_bucket: 7,
      wood: 8,
      arrow: 9,
    },
  },
  "Bridge Duel": {
    mode: "bridge_duel",
    tokens: {
      iron_sword: 0,
      diamond_pickaxe: 1,
      bow: 2,
      stained_clay: 3,
      golden_apple: 5,
      arrow: 7,
      glyph_menu: 9,
    },
  },
  "NoDebuff Duel": {
    mode: "potion_duel",
    tokens: {
      diamond_sword: 0,
      ender_pearl: 1,
      cooked_beef: 2,
      heal_potion: 3,
      fire_resistance_potion: 7,
      speed_potion: 8,
    },
  },
  "Combo Duel": {
    mode: "combo_duel",
    tokens: { diamond_sword: 0, golden_apple: 1, potion: 2, ender_pearl: 4 },
  },
  "OP Duel": {
    mode: "op_duel",
    tokens: {
      diamond_sword: 0,
      fishing_rod: 1,
      bow: 2,
      flint_and_steel: 3,
      golden_apple: 4,
      speed_potion: 5,
      speed_potion2: 6,
      regen_potion: 7,
      regen_potion2: 8,
      arrow: 9,
    },
  },
  "Classic Duel": {
    mode: "classic_duel",
    tokens: { iron_sword: 0, fishing_rod: 1, bow: 2, arrow: 9 },
  },
  "Classic Doubles": {
    mode: "classic_doubles",
    tokens: { iron_sword: 0, fishing_rod: 1, bow: 2, arrow: 9 },
  },
  "Bow Duel": {
    mode: "bow_duel",
    tokens: { bow: 0, ender_pearl: 1, arrow: 9 },
  },
  "Bed Rush Duel": {
    mode: "bedwars_two_one_duels_rush",
    tokens: { sword: 0, wool: 1, shears: 2, wood_pickaxe: 3, wood_axe: 4 },
  },
  "Quakecraft Duel": {
    mode: "quake_duel",
    tokens: { railgun: 0, layout_compass: 1 },
  },
} as const;

const TNT_GAMES_EDITORS = {
  "TNT Run": {
    mode: "tntrun",
    tokens: { double_jump: 0, speed_potion: 1, slowness_potion: 2 },
  },
  "PVP Run": {
    mode: "pvprun",
    tokens: {
      iron_sword: 0,
      double_jump: 1,
      slowness_potion: 2,
      speed_potion: 3,
    },
  },
  "Bow Spleef": {
    mode: "spleef",
    tokens: { bow: 0, double_jump: 1, arrow_volley: 2, arrow: 3 },
  },
  Wizards: {
    mode: "wizards",
    tokens: { attack_wand: 0, defense_wand: 1, class_selector: 8 },
  },
  "TNT Tag": { mode: "tnttag", tokens: { tnt: 0, locate_compass: 1 } },
} as const;

// A per-kit editor's kit is the one the next picker shows as selected
const KIT_EDITORS = {
  "Layout Editor - Blitz Duel": "blitz_duel",
  "Layout Editor - Mega Walls Duel": "mw_duel",
  "Layout Editor - SkyWars Duel": "sw_duel",
} as const;

// SkyWars Duel's Mini page is the one with Champion, a kit only Mini has
const SKYWARS_MINI_KIT = "Champion";

// Blitz and Mega Walls editors share titles, so Go Back's page tells them apart
const LEGACY_KIT_PAGES = { Upgrades: "blitz", Class: "megawalls" } as const;

const SAVED_LAYOUTS = { blitz: ["Pigman"], megawalls: [] as string[] };

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const ARMOR_PIECE =
  /(Leather|Chainmail|Iron|Gold|Diamond) (Helmet|Chestplate|Leggings|Boots)$/;

interface DumpItem {
  id: string;
  damage: number;
  count: number;
  name: string;
  lore: string[];
  nbt: string;
  seen: string[];
}

interface Screen {
  title: string;
  size: number;
  capturedAt: string;
  slots: { slot: number; item: DumpItem | null }[];
}

type Tokens = Record<string, ItemStack>;

interface LegacyName {
  id: number;
  displayName: string;
  variations?: { metadata: number; displayName: string }[];
}

const paths = process.argv.slice(2);
if (paths.length === 0)
  throw new Error("Pass the paths to StatsifyDump exports");

const [dumps, legacyItems, legacyBlocks, legacyEnchantments] =
  await Promise.all([
    Promise.all(
      paths.map(
        async (path) =>
          JSON.parse(await readFile(path, "utf8")) as {
            items: DumpItem[];
            screens?: Screen[];
          },
      ),
    ),
    fetchMinecraftData<(LegacyName & { name: string })[]>("1.8/items.json"),
    fetchMinecraftData<LegacyName[]>("1.8/blocks.json"),
    fetchMinecraftData<{ id: number; displayName: string }[]>(
      "1.8/enchantments.json",
    ),
  ]);
const items = dumps.flatMap((dump) => dump.items);
const screens = dumps
  .flatMap((dump) => dump.screens ?? [])
  .toSorted((a, b) => a.capturedAt.localeCompare(b.capturedAt));

const legacyIds = new Map(legacyItems.map(({ id, name }) => [name, id]));
const materials = new Map(
  Object.entries(data.materials).map(([name, id]) => [id, name.toLowerCase()]),
);

// A name two items share matches neither
const legacyNames = new Map<
  string,
  { id: number; damage: number } | undefined
>();
for (const { id, displayName, variations = [] } of [
  ...legacyItems,
  ...legacyBlocks,
]) {
  for (const { metadata: damage, displayName: name } of [
    { metadata: 0, displayName },
    ...variations,
  ]) {
    const known = legacyNames.get(name);
    const same =
      !legacyNames.has(name) || (known?.id === id && known.damage === damage);
    legacyNames.set(name, same ? { id, damage } : undefined);
  }
}

function namedItem(name: string) {
  const material = legacyMaterialId(name.toUpperCase().replaceAll(" ", "_"));
  return (
    legacyNames.get(name) ??
    (material === undefined ? undefined : { id: material, damage: 0 })
  );
}

const isBlank = (line: string) => removeFormatting(line).trim() === "";

// The editor's chest: the main rows in 0 to 26, the hotbar in 36 to 44
function storedSlot(slot: number) {
  if (slot >= 36 && slot <= 44) return slot - 36;
  return slot <= 26 ? slot + 9 : undefined;
}

const untypedEgg = (item: DumpItem) =>
  item.id === "minecraft:spawn_egg" &&
  isUntypedEgg(legacyId(item), item.damage);

function editorItems(screen: Screen) {
  const stored: { slot: number; item: DumpItem }[] = [];

  for (const { slot, item } of screen.slots) {
    const storedAt = storedSlot(slot);
    if (item && storedAt !== undefined && !untypedEgg(item))
      stored.push({ slot: storedAt, item });
  }

  return stored;
}

// Older dumps have no editor screens, only the slots each item was seen in
function editor(title: string) {
  const screen = screens.find(
    (shown) => removeFormatting(shown.title) === `Layout Editor - ${title}`,
  );
  // Wizards fills the main rows with blank panes, as its kit fits the hotbar
  if (screen)
    return editorItems(screen).filter(
      ({ item }) => removeFormatting(item.name).trim() !== "",
    );

  const seenItems: { slot: number; item: DumpItem }[] = [];

  for (const item of items) {
    for (const seen of item.seen) {
      const match = /^Layout Editor - (.+) #(\d+) of 90$/.exec(seen);
      const slot =
        match?.[1] === title ? storedSlot(Number(match[2])) : undefined;
      if (slot !== undefined) seenItems.push({ slot, item });
    }
  }

  return seenItems;
}

function legacyId({ id }: DumpItem) {
  const numeric = legacyIds.get(withoutNamespace(id));
  if (numeric === undefined) throw new Error(`No 1.8 id for ${id}`);
  return numeric;
}

function kitItem(dumped: DumpItem, numeric = legacyId(dumped)): ItemStack {
  const { id, damage, count, name, lore, nbt } = dumped;
  const item = legacyItem(numeric, damage);
  if (!item) throw new Error(`No 26.3 item for ${id}:${damage}`);
  const color = /display:\{[^}]*color:(\d+)/.exec(nbt)?.[1];

  return {
    ...item,
    count: count > 1 ? count : undefined,
    color: color === undefined ? undefined : Number(color),
    name: /display:\{[^}]*Name:"/.test(nbt) ? name : undefined,
    tooltip: lore.length > 0 ? lore : undefined,
    enchanted: nbt.includes("ench:[") || undefined,
    skin: nbt
      .matchAll(/"(eyJ[\w+/=]+)"/g)
      .map(([, texture]) => skinUrl(texture))
      .find(Boolean),
  };
}

const sameItemKey = ({ material, item }: KitItem) =>
  JSON.stringify({ material, item });

const output = {
  modes: {} as Record<string, Tokens>,
  defaults: {} as Record<string, Record<string, string>>,
  kits: {} as Record<string, Record<string, Kit>>,
};

const missing: string[] = [];
const unnamed = new Set<string>();
const unmatched: string[] = [];

function singleKit(title: string, tokens: Readonly<Record<string, number>>) {
  const shown = editor(title);

  if (shown.length === 0) {
    missing.push(title);
    return undefined;
  }

  const kit: Tokens = Object.fromEntries(
    Object.entries(tokens).map(([token, slot]) => {
      const entry = shown.find((shownItem) => shownItem.slot === slot);
      if (!entry)
        throw new Error(`${title} shows nothing in slot ${slot} for ${token}`);
      return [token, kitItem(entry.item)];
    }),
  );
  // Reversed so the first token with an item wins
  const tokenOf = new Map(
    Object.entries(kit)
      .toReversed()
      .map(([token, item]) => [JSON.stringify(item), token]),
  );

  // Only a player who never saved this mode's layout sees the default
  const layout: Record<string, string> = {};
  for (const { slot, item } of shown) {
    const token =
      Object.entries(tokens).find(([, at]) => at === slot)?.[0] ??
      tokenOf.get(JSON.stringify(kitItem(item)));
    if (!token)
      throw new Error(
        `${title} shows an item in slot ${slot} that no token has`,
      );
    if (layout[slot] && layout[slot] !== token)
      throw new Error(`${title} shows two items in slot ${slot}`);
    layout[slot] = token;
  }

  return { kit, layout };
}

for (const [title, { mode, tokens }] of Object.entries(SINGLE_KIT_EDITORS)) {
  const found = singleKit(title, tokens);
  if (!found) continue;
  output.modes[mode] = found.kit;
  output.defaults[mode] = found.layout;
}

const tntGames: Record<string, TntGamesMode> = {};

for (const [name, { mode, tokens }] of Object.entries(TNT_GAMES_EDITORS)) {
  const found = singleKit(name, tokens);
  if (found)
    tntGames[mode] = { name, tokens: found.kit, default: found.layout };
}

function pickerEntries(screen: Screen) {
  const entries: DumpItem[] = [];
  for (const { slot, item } of screen.slots)
    if (item && slot < screen.size - 36) entries.push(item);
  return entries;
}

function selected(screen: Screen) {
  for (const item of pickerEntries(screen)) {
    const name = /^Currently Selected - (.+)$/.exec(
      removeFormatting(item.name),
    )?.[1];
    if (name) return { name, lore: item.lore, icon: item };
  }

  return undefined;
}

const SKULL = 397;

// Shark's "Skull Item" takes the skin of Blitz's dumped "Shark's Head"
function pickerSkull(text: string, kit: string) {
  if (text === "Wither Skeleton Skull") return legacyItem(SKULL, 1);
  if (text !== "Skull Item") return undefined;

  const head = items.find(
    (item) => removeFormatting(item.name) === `${kit}'s Head`,
  );
  if (!head)
    unmatched.push(`${kit}'s Skull Item, as no ${kit}'s Head was dumped`);
  return head && { ...legacyItem(SKULL, 3)!, skin: kitItem(head).skin };
}

function pickerArmor(lore: string[], kit: string) {
  const lines = lore.map(removeFormatting);
  const armor: Record<number, ItemStack> = {};

  for (const [index, line] of lines.entries()) {
    // Blitz indents enchantments under each item, and SkyWars drops the bullet
    if (/^\s{2,}/.test(line)) continue;
    const text = line.replace(/^ ▪ /, "").replace(/ x\d+$/, "");
    const enchanted = /^\s{2,}[∙▪]/.test(lines[index + 1] ?? "") || undefined;

    const skull = pickerSkull(text, kit);
    if (skull) armor[ARMOR.helmet] = { ...skull, enchanted };

    const match = ARMOR_PIECE.exec(text);
    if (!match) continue;
    const material = match[1] === "Gold" ? "golden" : match[1].toLowerCase();
    const piece = match[2].toLowerCase() as keyof typeof ARMOR;
    armor[ARMOR[piece]] = {
      id: namespaced(`${material}_${piece}`),
      color: leatherColor(text),
      enchanted,
    };
  }

  return Object.keys(armor).length > 0 ? armor : undefined;
}

function iconDye(icon: DumpItem, pieces: ItemStack[]) {
  if (!icon.id.startsWith("minecraft:leather_")) return;
  const { id, color } = kitItem(icon);
  const piece = pieces.find(
    (listed) => listed.id === id && listed.color === undefined,
  );
  if (piece && color !== undefined) piece.color = color;
}

const skyWarsPages = screens
  .filter((screen) => /Choose Your Kit/.test(screen.title))
  .map((screen) => {
    const entries = pickerEntries(screen).filter((item) =>
      item.lore.some((line) => /Click to select/.test(removeFormatting(line))),
    );
    return {
      mini: entries.some((item) =>
        removeFormatting(item.name).startsWith(SKYWARS_MINI_KIT),
      ),
      entries,
    };
  });

// The selected kit's copy of the lore lacks the blank line ending the list
function itemList(lore: string[]) {
  const end = lore.findIndex((line) => removeFormatting(line) === "");
  return JSON.stringify(end === -1 ? lore : lore.slice(0, end));
}

function skyWarsGroup(name: string, lore: string[]) {
  const page = skyWarsPages.find(({ entries }) =>
    entries.some(
      (item) =>
        removeFormatting(item.name).replace(/ - .+$/, "") === name &&
        itemList(item.lore) === itemList(lore),
    ),
  );
  if (!page) throw new Error(`No SkyWars kit page lists ${name}`);
  return page.mini ? "Mini" : "Insane";
}

const skyWarsDuelEditors: { key: string; lore: string[]; shown: DumpItem[] }[] =
  [];

for (const [title, mode] of Object.entries(KIT_EDITORS)) {
  const kits: Record<string, Kit> = {};

  for (const [index, screen] of screens.entries()) {
    if (removeFormatting(screen.title) !== title) continue;
    const kit = screens
      .slice(index + 1)
      .map(selected)
      .find(Boolean);
    // Only the next picker names an editor's kit, so a last editor is skipped
    if (!kit) {
      unnamed.add(title);
      continue;
    }

    const group =
      mode === "sw_duel" ? skyWarsGroup(kit.name, kit.lore) : undefined;
    const key = group
      ? `${group.toLowerCase()}_${kitKey(kit.name)}`
      : kitKey(kit.name);
    // The first screen is the default, since the player may move items later
    if (kits[key]) continue;

    const shown = editorItems(screen).toSorted((a, b) => a.slot - b.slot);
    const armor = pickerArmor(kit.lore, kit.name);
    iconDye(kit.icon, Object.values(armor ?? {}));

    kits[key] = {
      name: group ? `${group} ${kit.name}` : kit.name,
      items: shown.map(({ slot, item }) => {
        const numeric = legacyId(item);
        const material = materials.get(numeric);
        if (!material) throw new Error(`No Bukkit material for ${item.id}`);
        return { slot, material, item: kitItem(item, numeric) };
      }),
      armor,
    };
    if (mode === "sw_duel")
      skyWarsDuelEditors.push({
        key,
        lore: kit.lore,
        shown: shown.map(({ item }) => item),
      });
  }

  if (Object.keys(kits).length === 0) {
    missing.push(title);
    continue;
  }

  // An item most kits show is shared, so its token has no kit prefix
  const counts = new Map<string, number>();
  for (const { items: kitItems } of Object.values(kits)) {
    for (const key of new Set(kitItems.map(sameItemKey)))
      counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const half = Object.keys(kits).length / 2;
  for (const kit of Object.values(kits)) {
    kit.items = kit.items.map((entry) => {
      const { slot, material, item } = entry;
      return {
        slot,
        material,
        shared: counts.get(sameItemKey(entry))! > half || undefined,
        item,
      };
    });
  }

  output.kits[mode] = kits;
}

const enchantmentIds = new Map(
  legacyEnchantments.map(({ id, displayName }) => [displayName, id]),
);

const POTION = 373;
const SPLASH = 0x40_00;

// An enchanted book keeps its enchantments in StoredEnchantments
const dumpedEnchantments = ({ nbt }: DumpItem) =>
  [
    ...(/(?:ench|StoredEnchantments):\[([^\]]*)\]/
      .exec(nbt)?.[1]
      .matchAll(/id:(\d+)s/g) ?? []),
  ].map(([, id]) => Number(id));

const sameIds = (a: number[], b: number[]) =>
  a.toSorted().join() === b.toSorted().join();

function skyWarsToken(id: number, damage: number, enchantments: number[]) {
  const material = materials.get(id);
  if (!material) throw new Error(`No Bukkit material for ${id}`);
  const ids = enchantments.toSorted((a, b) => a - b).join(",");
  return [
    material.toUpperCase(),
    id === POTION ? damage & 0x1f_ff : damage,
    ...(ids ? [ids] : []),
  ].join(":");
}

const backTo = (screen: Screen) =>
  removeFormatting(
    screen.slots.find(
      ({ item }) => item && removeFormatting(item.name) === "Go Back",
    )?.item?.lore[0] ?? "",
  ).replace(/^To /, "");

const SKYWARS_MENU = /^(Normal|Insane|Mini|Mega) Kits$/;

const skyWarsCustomizers = new Map<
  string,
  { slot: number; item: DumpItem }[]
>();

for (const [index, screen] of screens.entries()) {
  const kit = /^(.+) Kit Customizer$/.exec(removeFormatting(screen.title))?.[1];
  // A screen without its buttons was captured before it finished loading
  if (!kit || backTo(screen) !== `${kit} Kit`) continue;

  const page = screens
    .slice(0, index)
    .findLast((shown) => removeFormatting(shown.title) === `${kit} Kit`);
  const menu = page && SKYWARS_MENU.exec(backTo(page))?.[1];
  if (!menu) throw new Error(`No SkyWars kit menu before ${screen.title}`);

  const key = `${menu.toLowerCase()}_${kitKey(kit)}`;
  if (skyWarsCustomizers.has(key)) continue;
  skyWarsCustomizers.set(key, editorItems(screen));
}

interface Listed {
  text: string;
  count?: number;
  enchantments: string[];
}

// Lines without §5§o are the client's, like a potion's effects or "Dyed"
function listedItems(lore: string[]) {
  const listed: Listed[] = [];
  let wrapped = false;

  for (const line of lore.filter((shown) => shown.startsWith("§5§o"))) {
    if (isBlank(line)) break;
    const enchantment = /^§5§o§7 {3}∙ (.+?)(?: x(\d+))?$/.exec(line);
    const text = /^§5§o§7§7([^§].*)$/.exec(line)?.[1];
    const last = listed.at(-1);

    if (enchantment && last) {
      last.enchantments.push(removeFormatting(enchantment[1]));
      if (enchantment[2]) last.count = Number(enchantment[2]);
    } else if (text) {
      // A §7§7 note that wraps ends its first line with a comma
      const note = wrapped || text.endsWith(",");
      wrapped = text.endsWith(",");
      if (note) continue;

      const [, name, count] = /^(.+?)(?: x(\d+))?$/.exec(text)!;
      listed.push({
        text: name,
        count: count ? Number(count) : undefined,
        enchantments: [],
      });
    }
  }

  return listed;
}

type Pooled = { slot?: number; item: DumpItem };

const listedEnchantments = ({ enchantments }: Listed) =>
  enchantments.map((line) =>
    enchantmentIds.get(/^(.+) [IVXLC]+$/.exec(line)?.[1] ?? ""),
  );

const fitting = (listed: Listed, pool: Pooled[]) =>
  pool.filter(
    ({ item }) =>
      (item.count > 1 ? item.count : undefined) === listed.count &&
      sameIds(dumpedEnchantments(item), listedEnchantments(listed) as number[]),
  );

function namedListed({ text }: Listed) {
  const armor = ARMOR_PIECE.exec(text);
  const egg = /^(.+) Egg$/.exec(text)?.[1];
  // 1.8 names spawn eggs like "Spawn Bat"
  return armor
    ? namedItem(armor[0])
    : (namedItem(text) ?? (egg ? namedItem(`Spawn ${egg}`) : undefined));
}

function dumpedListed(listed: Listed, pool: Pooled[]) {
  const fits = fitting(listed, pool);
  const named = namedListed(listed);
  const potion = /^(Splash )?Potion of (\w+)/.exec(listed.text);
  const potions = fits.filter(
    ({ item }) =>
      potion &&
      legacyId(item) === POTION &&
      Boolean(item.damage & SPLASH) === Boolean(potion[1]),
  );
  const described = potions.filter(({ item }) =>
    [item.name, ...item.lore].some(
      (line) => potion && removeFormatting(line).includes(potion[2]),
    ),
  );

  const match =
    fits.find(({ item }) => removeFormatting(item.name) === listed.text) ??
    (named && fits.find(({ item }) => legacyId(item) === named.id));
  if (match) return match;

  if (potions.length === 1) return potions[0];
  return described.length === 1 ? described[0] : undefined;
}

function lobbyItem(listed: Listed, dumped?: Pooled) {
  if (dumped) {
    const id = legacyId(dumped.item);
    const token = skyWarsToken(
      id,
      dumped.item.damage,
      dumpedEnchantments(dumped.item),
    );
    return { id, slot: dumped.slot, token, item: kitItem(dumped.item, id) };
  }

  const ids = listedEnchantments(listed);
  const named = namedListed(listed);
  const item = named && legacyItem(named.id, named.damage);
  if (!named || !item || ids.includes(undefined)) return undefined;

  const { count, enchantments } = listed;
  return {
    id: named.id,
    token: skyWarsToken(named.id, named.damage, ids as number[]),
    item: {
      ...item,
      color: leatherColor(listed.text),
      count,
      enchanted: enchantments.length > 0 || undefined,
      tooltip: enchantments.length > 0 ? enchantments : undefined,
    },
  };
}

const skyWarsKits: Record<string, SkyWarsKit> = {};

for (const screen of screens) {
  const menu = SKYWARS_MENU.exec(removeFormatting(screen.title))?.[1];
  if (!menu) continue;

  for (const entry of pickerEntries(screen)) {
    if (
      !entry.lore.some(
        (line) => removeFormatting(line) === "Right-click to open breakdown!",
      )
    )
      continue;
    const name = `${menu} ${removeFormatting(entry.name)}`;
    const key = `${menu.toLowerCase()}_${kitKey(removeFormatting(entry.name))}`;
    if (skyWarsKits[key]) continue;

    const listed = listedItems(entry.lore);
    const duel = skyWarsDuelEditors.find(
      ({ lore }) =>
        JSON.stringify(listedItems(lore)) === JSON.stringify(listed),
    );
    const pool: Pooled[] = [
      ...(skyWarsCustomizers.get(key) ??
        duel?.shown
          .filter(
            (_, index) => !output.kits.sw_duel[duel.key].items[index].shared,
          )
          .map((item) => ({ item })) ??
        []),
    ];

    const dumped = listed.map((item) => {
      const match = dumpedListed(item, pool);
      if (match) pool.splice(pool.indexOf(match), 1);
      return match;
    });

    // The last item left is the last listed one no name matched, like Bookcase
    const left = [...listed.keys()].filter(
      (index) => !dumped[index] && !lobbyItem(listed[index]),
    );
    if (
      left.length === 1 &&
      pool.length === 1 &&
      fitting(listed[left[0]], pool).length === 1
    )
      dumped[left[0]] = pool.pop();

    const items: SkyWarsKit["items"] = [];
    // A player who never saved a layout gets the list in order from slot 0,
    // with the armor put on, as every Kit Customizer dumped shows
    let next = 0;
    let known = true;

    for (const [index, { text }] of listed.entries()) {
      const found = lobbyItem(listed[index], dumped[index]);
      if (!found) {
        unmatched.push(`SkyWars ${name}'s ${text}`);
        known = false;
        continue;
      }

      const material = materials.get(found.id)!;
      const armor = Object.entries(ARMOR).find(([piece]) =>
        material.endsWith(`_${piece}`),
      )?.[1];
      const slot = armor ?? next++;
      if (armor !== undefined && items.some((item) => item.slot === armor))
        throw new Error(`${name} lists two items for slot ${armor}`);
      if (known && found.slot !== undefined && found.slot !== slot) {
        throw new Error(
          `${name}'s Kit Customizer shows ${text} in slot ${found.slot}, not ${slot}`,
        );
      }

      const same = items.find(({ token }) => token === found.token);
      if (same && JSON.stringify(same.item) !== JSON.stringify(found.item))
        throw new Error(`${name} has two items stored as ${found.token}`);
      items.push({ slot, token: found.token, item: found.item });
    }

    iconDye(
      entry,
      items.map(({ item }) => item),
    );
    skyWarsKits[key] = {
      name,
      items: known ? items : items.map(({ token, item }) => ({ token, item })),
    };
  }
}

if (Object.keys(skyWarsKits).length === 0) missing.push("SkyWars kit menus");

const legacyKits = {
  blitz: {} as Record<string, LegacyKit>,
  megawalls: {} as Record<string, LegacyKit>,
};

// A renamed Blitz kit item gets a new name and an Owner line
const BLITZ_ITEM_NAME = /^§f.+'s (.+) §7\([IVX]+\)$/;
const blitzMaterialNames = new Map<string, string>();

for (const screen of screens) {
  for (const { item } of screen.slots) {
    const material = item && BLITZ_ITEM_NAME.exec(item.name)?.[1];
    if (item && material) blitzMaterialNames.set(item.id, material);
  }
}

function withoutRename(item: DumpItem, kit: string, level: number): DumpItem {
  const lore = item.lore.filter(
    (line) => !removeFormatting(line).startsWith("Owner: "),
  );
  if (lore.length === item.lore.length) return item;

  const material = blitzMaterialNames.get(item.id);
  if (!material)
    throw new Error(
      `No other Blitz kit names a ${item.id}, so ${kit}'s renamed one can't be restored`,
    );
  return {
    ...item,
    name: `§f${kit}'s ${material} §7(${ROMAN[level - 1]})`,
    lore,
  };
}

function legacyKitLevel(
  page: Screen,
  game: keyof typeof legacyKits,
  kit: string,
) {
  const entries = pickerEntries(page);

  if (game === "blitz") {
    const unlocked: number[] = [];

    for (const item of entries) {
      const level =
        ROMAN.indexOf(
          new RegExp(`^${kit} ([IVX]+)$`).exec(
            removeFormatting(item.name),
          )?.[1] ?? "",
        ) + 1;
      if (
        level > 0 &&
        item.lore.some((line) => removeFormatting(line) === "UNLOCKED")
      )
        unlocked.push(level);
    }
    if (unlocked.length === 0)
      throw new Error(`${page.title} shows no unlocked level`);
    return { level: Math.max(...unlocked) };
  }

  const upgrade = entries.find(
    (item) => removeFormatting(item.name) === `Kit - ${kit}`,
  );
  const tier = upgrade?.lore
    .map((line) => /^Tier: ([IVX]+)$/.exec(removeFormatting(line))?.[1])
    .find(Boolean);
  if (!upgrade || !tier) throw new Error(`${page.title} shows no Kit tier`);
  return {
    level: ROMAN.indexOf(tier) + 1,
    armor: pickerArmor(upgrade.lore, kit),
  };
}

for (const [index, screen] of screens.entries()) {
  const kit = /^Edit (.+) Layout$/.exec(removeFormatting(screen.title))?.[1];
  const page = /^(.+) (Upgrades|Class)$/.exec(backTo(screen));
  // A screen without its buttons was captured before it finished loading
  if (!kit || !page || page[1] !== kit) continue;

  const game = LEGACY_KIT_PAGES[page[2] as keyof typeof LEGACY_KIT_PAGES];
  const key = kitKey(kit);
  // The first screen is the default, since the player may move items later
  if (legacyKits[game][key]) continue;

  const pageTitle = `${kit} ${page[2]}`;
  const shownPage = screens
    .slice(0, index)
    .findLast((shown) => removeFormatting(shown.title) === pageTitle);
  if (!shownPage)
    throw new Error(`No ${pageTitle} page before ${screen.title}`);
  const { level, armor } = legacyKitLevel(shownPage, game, kit);

  const items = editorItems(screen)
    .map(({ slot, item }) => {
      const shown = game === "blitz" ? withoutRename(item, kit, level) : item;
      const numeric = legacyId(shown);
      return {
        slot,
        token: `${numeric},${shown.damage}`,
        item: kitItem(shown, numeric),
      };
    })
    .toSorted((a, b) => a.slot - b.slot);

  const tokens = items.map(({ token }) => token);
  if (new Set(tokens).size < tokens.length)
    throw new Error(`${screen.title} shows two items of one token`);

  legacyKits[game][key] = {
    name: kit,
    level,
    items,
    armor,
    saved: SAVED_LAYOUTS[game].includes(kit) || undefined,
  };
}

// The Upgrades page names few dyes, so leather takes its editor's color
const blitzArmor: Record<string, Record<number, ItemStack>[]> = {};

for (const screen of screens) {
  const kit = /^(.+) Upgrades$/.exec(removeFormatting(screen.title))?.[1];
  if (!kit) continue;
  const key = kitKey(kit);

  for (const entry of pickerEntries(screen)) {
    const tier = ROMAN.indexOf(
      new RegExp(`^${kit} ([IVX]+)$`).exec(removeFormatting(entry.name))?.[1] ??
        "",
    );
    if (tier === -1 || blitzArmor[key]?.[tier]) continue;

    const armor = pickerArmor(entry.lore, kit) ?? {};
    for (const piece of Object.values(armor)) {
      piece.color ??= legacyKits.blitz[key]?.items.find(
        ({ item }) => item.id === piece.id,
      )?.item.color;
    }
    (blitzArmor[key] ??= [])[tier] = armor;
  }
}

for (const [kit, levels] of Object.entries(blitzArmor)) {
  if (!ROMAN.every((_, tier) => levels[tier]))
    throw new Error(`${kit}'s Upgrades page misses a level`);
}

const isMenu = (shown: Screen, title: string, back?: string) =>
  removeFormatting(shown.title) === title &&
  shown.slots.some(
    ({ item }) =>
      item &&
      removeFormatting(item.name) === "Go Back" &&
      (back === undefined ||
        removeFormatting(item.lore[0] ?? "") === `To ${back}`),
  );

function menuScreen(title: string, back?: string) {
  const index = screens.findIndex((shown) => isMenu(shown, title, back));
  if (index === -1) missing.push(back ? `${back} > ${title}` : title);
  return index;
}

function menu(title: string, back?: string) {
  const screen = screens[menuScreen(title, back)];
  if (!screen) return [];

  return pickerEntries(screen).filter(
    (item) =>
      !/^(Go Back|Close|Reset .+|Left-click for (next|previous) page!|.+ Coins: .+)$/.test(
        removeFormatting(item.name),
      ),
  );
}

const MENU_STATUS =
  /^(Click to (select|purchase|view)!|> Click to activate! <|>>> ACTIVE <<<|SELECTED!|Equipped!|Missing parts!|Cost: .+|Unlocked in .+|[✖✔] .+|Choose an? .+!|Collect all the hats!)$/;

// Only real enchantments glint, since the menu glints the selected item
function menuItem(dumped: DumpItem, recolor: boolean): ItemStack {
  const item = kitItem(dumped);
  const tooltip: string[] = [];
  let dropping = false;

  for (const line of dumped.lore) {
    const text = removeFormatting(line).trim();
    const continuesStatus: boolean =
      dropping && /^\s/.test(removeFormatting(line)) && text !== "";
    dropping = MENU_STATUS.test(text) || continuesStatus;

    const extraBlank =
      isBlank(line) && (tooltip.length === 0 || isBlank(tooltip.at(-1)!));
    if (dropping || extraBlank) continue;
    tooltip.push(line);
  }
  while (tooltip.length > 0 && isBlank(tooltip.at(-1)!)) tooltip.pop();

  return {
    ...item,
    name: recolor ? dumped.name.replace(/^§[ac7]/, "§a") : dumped.name,
    tooltip: tooltip.length > 0 ? tooltip : undefined,
    enchanted: /ench:\[\d/.test(dumped.nbt) || undefined,
  };
}

function byKey(entries: [string, ItemStack][], where: string) {
  const keyed: Record<string, ItemStack> = {};
  for (const [key, item] of entries) {
    if (keyed[key]) throw new Error(`${where} has two items keyed ${key}`);
    keyed[key] = item;
  }
  return keyed;
}

// The stats keys call the Laser sight and the Kits menu's chestplates armor
const QUAKE_MENUS = [
  ["case", "Case", "Quakecraft Shop"],
  ["barrel", "Barrel", "Quakecraft Shop"],
  ["trigger", "Trigger", "Quakecraft Shop"],
  ["muzzle", "Muzzle", "Quakecraft Shop"],
  ["sight", "Laser", "Quakecraft Shop"],
  ["hat", "Hats", "Armor"],
  ["hat", "(2/2) Hats", "Armor"],
  ["armor", "Kits", "Armor"],
  ["leggings", "Leggings", "Armor"],
  ["boots", "Boots", "Armor"],
] as const;

const DIGITS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

function quakeKey(part: (typeof QUAKE_MENUS)[number][0], item: DumpItem) {
  const name = removeFormatting(item.name);

  // Triggers are stored spelled out: 0.85s is ZERO_POINT_EIGHT_FIVE
  if (part === "trigger") {
    const time = /^(\d+\.\d+)s/.exec(name)?.[1];
    if (!time) throw new Error(`Quake trigger ${name} names no time`);
    return [...time]
      .map((char) => (char === "." ? "point" : DIGITS[Number(char)]))
      .join("");
  }

  // Cases are stored by Bukkit material, with SHINY_ for the Power X ones
  if (part === "case") {
    const material = materials.get(legacyId(item));
    if (!material) throw new Error(`No Bukkit material for ${item.id}`);
    return kitKey(`${/ench:\[\d/.test(item.nbt) ? "shiny" : ""}${material}`);
  }

  return kitKey(name.replace(/ \S+$/, ""));
}

const quake: Record<string, Record<string, ItemStack>> = {};

for (const [part, title, back] of QUAKE_MENUS) {
  // The axe cases' ids aren't their Bukkit material, so they can't be matched
  const entries = menu(title, back)
    .filter((item) => part !== "case" || !item.id.endsWith("_axe"))
    .map((item): [string, ItemStack] => [
      quakeKey(part, item),
      menuItem(item, true),
    ]);
  quake[part] = byKey(
    [...Object.entries(quake[part] ?? {}), ...entries],
    `Quake ${title}`,
  );
}

const ARENA_SKILLS = {
  offensive: "Offensive Skills",
  utility: "Utility Skills",
  support: "Support Skills",
  ultimate: "Ultimate Skills",
} as const;

const arena: Record<string, Record<string, ItemStack>> = {};

for (const [slot, title] of Object.entries(ARENA_SKILLS)) {
  arena[slot] = byKey(
    menu(title).map((item) => [
      kitKey(removeFormatting(item.name)),
      menuItem(item, true),
    ]),
    `Arena ${title}`,
  );
}

// Runes keep only their name, since the stored level may count differently
const runes: [string, ItemStack][] = [];

for (const item of menu("Runes")) {
  const rune = /^Rune of ([A-Za-z]+)$/.exec(removeFormatting(item.name))?.[1];
  if (rune)
    runes.push([
      kitKey(rune),
      { ...menuItem(item, false), tooltip: undefined },
    ]);
}

arena.active_rune = byKey(runes, "Arena Runes");

const KART_SELECTORS = {
  ENGINE: "Engine Selector",
  TURBOCHARGER: "Turbocharger Selector",
  FRAME: "Frame Selector",
} as const;

const kart: Record<string, KartPart[]> = {};

for (const [type, title] of Object.entries(KART_SELECTORS)) {
  const parts: KartPart[] = [];
  const suffix = title.replace(/^(\w+) Selector$/, " $1");

  // A selector lists only the owned parts, so a later screen can show more
  const shown = screens
    .filter((screen) => isMenu(screen, title))
    .flatMap(pickerEntries);
  for (const item of shown.filter((item) =>
    removeFormatting(item.name).endsWith(suffix),
  )) {
    const rarity = removeFormatting(item.name).split(" ").at(-2)!.toUpperCase();
    const attributes: Record<string, number> = {};

    for (const line of item.lore) {
      const name = /^>+\s+(.+)$/.exec(removeFormatting(line))?.[1];
      if (name)
        attributes[name.toUpperCase().replaceAll(" ", "_")] =
          line.match(/§a>/g)?.length ?? 0;
    }

    const part = { rarity, attributes, item: kitItem(item) };
    if (!parts.some((shown) => JSON.stringify(shown) === JSON.stringify(part)))
      parts.push(part);
  }

  if (parts.length > 0) kart[type] = parts;
  else missing.push(title);
}

const speedUhc: Record<string, Record<string, (ItemStack | null)[]>> = {};

function speedUhcKit(kit: DumpItem) {
  const items: (ItemStack | null)[] = [];

  // The client puts the icon's enchantments above lore lines, which start §5§o
  const lines = kit.lore.filter((line) => line.startsWith("§5§o"));
  const end = lines.findIndex(isBlank);

  for (const line of lines.slice(0, end === -1 ? undefined : end)) {
    const enchantment = /^\s+∙ (.+)$/.exec(removeFormatting(line))?.[1];
    const last = items.at(-1);
    if (enchantment) {
      if (last)
        Object.assign(last, {
          enchanted: true,
          tooltip: [...(last.tooltip ?? []), enchantment],
        });
      continue;
    }

    const [, name, count] = /^(.+?)(?: x(\d+))?$/.exec(removeFormatting(line))!;
    const named = namedItem(name);
    const item = named && legacyItem(named.id, named.damage);
    if (!item)
      unmatched.push(`Speed UHC ${removeFormatting(kit.name)}'s ${name}`);
    items.push(
      item ? { ...item, count: count ? Number(count) : undefined } : null,
    );
  }

  return items;
}

const kitsPage = menuScreen("Kits", "Speed UHC Shop");

if (kitsPage !== -1) {
  const mode = screens
    .slice(0, kitsPage)
    .filter((screen) => removeFormatting(screen.title) === "Speed UHC Shop")
    .flatMap(pickerEntries)
    .findLast((item) => removeFormatting(item.name) === "Kits")
    ?.lore.map(removeFormatting)
    .join(" ")
    .match(/kits for (\w+) Mode/)?.[1];
  if (!mode)
    throw new Error("No Speed UHC Shop before its Kits page names the mode");

  speedUhc[mode.toLowerCase()] = Object.fromEntries(
    menu("Kits", "Speed UHC Shop").map((kit) => [
      kitKey(removeFormatting(kit.name)),
      speedUhcKit(kit),
    ]),
  );
}

// Only a game's Gear Selector lists the free Default kit
const gearSelector = screens.find(
  (screen) => removeFormatting(screen.title) === "Gear Selector",
);
const defaultKit =
  gearSelector &&
  pickerEntries(gearSelector).find(
    (item) => removeFormatting(item.name) === "Default",
  );
if (defaultKit && speedUhc.normal)
  speedUhc.normal.default = speedUhcKit(defaultKit);

const count = (menus: Record<string, object>) =>
  Object.values(menus).reduce(
    (sum, items) => sum + Object.keys(items).length,
    0,
  );

async function writeData(file: string, found: boolean, value: unknown) {
  if (found)
    await writeFile(
      new URL(`../data/${file}`, import.meta.url),
      `${JSON.stringify(value, null, 2)}\n`,
    );
}

await Promise.all([
  writeData(
    "duels-modes.json",
    Object.keys(output.modes).length > 0 || Object.keys(output.kits).length > 0,
    output,
  ),
  writeData("tnt-games.json", Object.keys(tntGames).length > 0, tntGames),
  writeData("legacy-kits.json", count(legacyKits) > 0, {
    ...legacyKits,
    blitzArmor,
  }),
  writeData(
    "skywars-kits.json",
    Object.keys(skyWarsKits).length > 0,
    skyWarsKits,
  ),
  writeData("quake.json", count(quake) > 0, quake),
  writeData("arena.json", count(arena) > 0, arena),
  writeData("turbo-kart-racers.json", count(kart) > 0, kart),
  writeData("speed-uhc.json", count(speedUhc) > 0, speedUhc),
]);

console.log(
  `${Object.keys(output.modes).length} Duels modes, ${Object.keys(tntGames).length} TNT Games modes; kits: ${Object.entries(
    output.kits,
  )
    .map(([mode, kits]) => `${mode} ${Object.keys(kits).length}`)
    .join(
      ", ",
    )}, blitz ${Object.keys(legacyKits.blitz).length}, megawalls ${Object.keys(legacyKits.megawalls).length}, SkyWars ${Object.keys(skyWarsKits).length}` +
    `; Quake ${count(quake)} items, Arena ${count(arena)}, TKR ${count(kart)} parts, Speed UHC ${count(speedUhc)} kits` +
    (missing.length > 0 ? `; not in these dumps: ${missing.join(", ")}` : "") +
    (unnamed.size > 0
      ? `; skipped the last screens of ${[...unnamed].join(", ")}, which no picker follows`
      : "") +
    (unmatched.length > 0
      ? `; left out ${unmatched.join(", ")}, whose names match no item`
      : ""),
);
