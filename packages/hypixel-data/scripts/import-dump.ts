/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Builds every data/*.json from StatsifyDump exports of the games' layout
// editors, kit menus and shop menus, so each item has the count, name and tooltip the game gives it. Each dump session writes its own exports, so pass the last export
// of every session needed:
//   pnpm --filter @statsify/hypixel-data build
//   node scripts/import-dump.ts <dump.json> [<dump.json> …]

import {
  ARMOR,
  type KartPart,
  type Kit,
  type KitItem,
  type LegacyKit,
  type SkyWarsKit,
  kitKey,
  leatherColor,
  skinUrl,
} from "@statsify/hypixel-data";
import { type ItemStack, legacyItem } from "@statsify/textures";
import { readFile, writeFile } from "node:fs/promises";
import data from "@statsify/textures/data/minecraft-data.json" with { type: "json" };

const MINECRAFT_DATA = "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/3.117.0/data/pc";

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${MINECRAFT_DATA}/${path}`);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json() as Promise<T>;
};

// Each single-kit editor's mode, as its layout_<mode>_layout key names it, and its tokens
// without copy numbers (wood_1 is wood) by the slot the editor shows the default layout in
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
    tokens: { iron_sword: 0, diamond_pickaxe: 1, bow: 2, stained_clay: 3, golden_apple: 5, arrow: 7, glyph_menu: 9 },
  },
  "NoDebuff Duel": {
    mode: "potion_duel",
    tokens: { diamond_sword: 0, ender_pearl: 1, cooked_beef: 2, heal_potion: 3, fire_resistance_potion: 7, speed_potion: 8 },
  },
  "Combo Duel": { mode: "combo_duel", tokens: { diamond_sword: 0, golden_apple: 1, potion: 2, ender_pearl: 4 } },
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
  "Classic Duel": { mode: "classic_duel", tokens: { iron_sword: 0, fishing_rod: 1, bow: 2, arrow: 9 } },
  "Classic Doubles": { mode: "classic_doubles", tokens: { iron_sword: 0, fishing_rod: 1, bow: 2, arrow: 9 } },
  "Bow Duel": { mode: "bow_duel", tokens: { bow: 0, ender_pearl: 1, arrow: 9 } },
  "Bed Rush Duel": {
    mode: "bedwars_two_one_duels_rush",
    tokens: { sword: 0, wool: 1, shears: 2, wood_pickaxe: 3, wood_axe: 4 },
  },
  "Quakecraft Duel": { mode: "quake_duel", tokens: { railgun: 0, layout_compass: 1 } },
} as const;

// TNT Games' editors, by the key each layout is stored under in TNTGames, and their tokens
const TNT_GAMES_EDITORS = {
  "TNT Run": { mode: "tntrun", tokens: { double_jump: 0, speed_potion: 1, slowness_potion: 2 } },
  "PVP Run": { mode: "pvprun", tokens: { iron_sword: 0, double_jump: 1, slowness_potion: 2, speed_potion: 3 } },
  "Bow Spleef": { mode: "spleef", tokens: { bow: 0, double_jump: 1, arrow_volley: 2, arrow: 3 } },
  Wizards: { mode: "wizards", tokens: { attack_wand: 0, defense_wand: 1, class_selector: 8 } },
  "TNT Tag": { mode: "tnttag", tokens: { tnt: 0, locate_compass: 1 } },
} as const;

// Editors with a layout per kit, whose kit is the one the picker shows as selected afterwards
const KIT_EDITORS = {
  "Layout Editor - Blitz Duel": "blitz_duel",
  "Layout Editor - Mega Walls Duel": "mw_duel",
  "Layout Editor - SkyWars Duel": "sw_duel",
} as const;

// SkyWars Duel has a Mini and an Insane kit picker, with some kits in both (Scout, Healer). The
// Mini page is the one with Champion, a kit only Mini has
const SKYWARS_MINI_KIT = "Champion";

// Blitz's and Mega Walls' "Edit <Kit> Layout" editors share titles (both have a Pigman), so the
// page their Go Back button returns to tells them apart
const LEGACY_KIT_PAGES = { Upgrades: "blitz", Class: "megawalls" } as const;

// Kits whose editor showed a layout the dumping account had saved, not the default
const SAVED_LAYOUTS = { blitz: ["Pigman"], megawalls: [] as string[] };

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const ARMOR_PIECE = /(Leather|Chainmail|Iron|Gold|Diamond) (Helmet|Chestplate|Leggings|Boots)$/;

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

const paths = process.argv.slice(2);
if (paths.length === 0) throw new Error("Pass the paths to StatsifyDump exports");

const dumps = await Promise.all(
  paths.map(async (path) => JSON.parse(await readFile(path, "utf8")) as { items: DumpItem[]; screens?: Screen[] }),
);
const items = dumps.flatMap((dump) => dump.items);
const screens = dumps.flatMap((dump) => dump.screens ?? []).toSorted((a, b) => a.capturedAt.localeCompare(b.capturedAt));

interface LegacyName {
  id: number;
  displayName: string;
  variations?: { metadata: number; displayName: string }[];
}

const legacyItems = await fetchJson<(LegacyName & { name: string })[]>("1.8/items.json");
const legacyIds = new Map(legacyItems.map(({ id, name }) => [name, id]));
const materials = new Map(Object.entries(data.materials).map(([name, id]) => [id, name.toLowerCase()]));

// Menus that list items by name use 1.8's own, Damage variants included (Blue Wool), or the
// item's Bukkit material ("Gold Helmet"); the rest are Hypixel's ("Awkward Potion"). minecraft-data
// gives some block items their item's name (Nether Quartz), so blocks' names count too, and a
// name two items share matches neither
const legacyNames = new Map<string, { id: number; damage: number } | undefined>();
for (const { id, displayName, variations = [] } of [...legacyItems, ...(await fetchJson<LegacyName[]>("1.8/blocks.json"))]) {
  for (const { metadata: damage, displayName: name } of [{ metadata: 0, displayName }, ...variations]) {
    const known = legacyNames.get(name);
    const same = !legacyNames.has(name) || (known?.id === id && known.damage === damage);
    legacyNames.set(name, same ? { id, damage } : undefined);
  }
}

const bukkitIds: Record<string, number | undefined> = data.materials;

function namedItem(name: string) {
  const material = bukkitIds[name.toUpperCase().replaceAll(" ", "_")];
  return legacyNames.get(name) ?? (material === undefined ? undefined : { id: material, damage: 0 });
}

const plain = (text: string) => text.replaceAll(/§./g, "");
const blank = (line: string) => plain(line).trim() === "";

// The editor's chest: the main rows in 0 to 26, the hotbar in 36 to 44
const storedSlot = (slot: number) => (slot >= 36 && slot <= 44 ? slot - 36 : slot <= 26 ? slot + 9 : undefined);

const editorItems = (screen: Screen) =>
  screen.slots.flatMap(({ slot, item }) => {
    const stored = storedSlot(slot);
    return item && stored !== undefined ? [{ slot: stored, item }] : [];
  });

/** A single-kit editor's items by stored slot, from its first screen (the default) or, in older dumps, where each was seen */
function editor(title: string) {
  const screen = screens.find((shown) => plain(shown.title) === `Layout Editor - ${title}`);
  // Wizards fills the main rows with blank panes, since its kit only fits the hotbar
  if (screen) return editorItems(screen).filter(({ item }) => plain(item.name).trim() !== "");

  return items.flatMap((item) =>
    item.seen.flatMap((seen) => {
      const match = /^Layout Editor - (.+) #(\d+) of 90$/.exec(seen);
      const slot = match?.[1] === title ? storedSlot(Number(match[2])) : undefined;
      return slot === undefined ? [] : [{ slot, item }];
    }),
  );
}

function legacyId({ id }: DumpItem) {
  const numeric = legacyIds.get(id.replace("minecraft:", ""));
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
    // Only a custom name: the rest take the pack's name, as other items do
    name: /display:\{[^}]*Name:"/.test(nbt) ? name : undefined,
    tooltip: lore.length > 0 ? lore : undefined,
    enchanted: nbt.includes("ench:[") || undefined,
    skin: nbt
      .matchAll(/"(eyJ[\w+/=]+)"/g)
      .map(([, texture]) => skinUrl(texture))
      .find(Boolean),
  };
}

const sameItemKey = ({ material, item }: KitItem) => JSON.stringify({ material, item });

const output = {
  modes: {} as Record<string, Tokens>,
  // Each single-kit mode's default layout, as Hypixel would store it
  defaults: {} as Record<string, Record<string, string>>,
  // Each kit's editor items in their default slots, and the armour its picker lists
  kits: {} as Record<string, Record<string, Kit>>,
};

const missing: string[] = [];
const unnamed = new Set<string>();
const unmatched: string[] = [];

/** A single-kit editor's item for each token, and its default layout as Hypixel would store it */
function singleKit(title: string, tokens: Readonly<Record<string, number>>) {
  const shown = editor(title);

  if (shown.length === 0) {
    missing.push(title);
    return undefined;
  }

  const kit: Tokens = Object.fromEntries(
    Object.entries(tokens).map(([token, slot]) => {
      const entry = shown.find((shownItem) => shownItem.slot === slot);
      if (!entry) throw new Error(`${title} shows nothing in slot ${slot} for ${token}`);
      return [token, kitItem(entry.item)];
    }),
  );
  // Reversed so the first token with an item wins
  const tokenOf = new Map(Object.entries(kit).toReversed().map(([token, item]) => [JSON.stringify(item), token]));

  // Only a player who never saved a layout sees the default, so dump with an account that hasn't
  // saved this mode. A slot the token list skips holds a copy (UHC's second lava bucket)
  const layout: Record<string, string> = {};
  for (const { slot, item } of shown) {
    const token = Object.entries(tokens).find(([, at]) => at === slot)?.[0] ?? tokenOf.get(JSON.stringify(kitItem(item)));
    if (!token) throw new Error(`${title} shows an item in slot ${slot} that no token has`);
    if (layout[slot] && layout[slot] !== token) throw new Error(`${title} shows two items in slot ${slot}`);
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

const tntGames: Record<string, { name: string; tokens: Tokens; default: Record<string, string> }> = {};

for (const [name, { mode, tokens }] of Object.entries(TNT_GAMES_EDITORS)) {
  const found = singleKit(name, tokens);
  if (found) tntGames[mode] = { name, tokens: found.kit, default: found.layout };
}

const pickerEntries = (screen: Screen) =>
  screen.slots.flatMap(({ slot, item }) => (item && slot < screen.size - 36 ? [item] : []));

/** The kit a picker shows as selected, its lore and its icon */
function selected(screen: Screen) {
  for (const item of pickerEntries(screen)) {
    const name = /^Currently Selected - (.+)$/.exec(plain(item.name))?.[1];
    if (name) return { name, lore: item.lore, icon: item };
  }

  return undefined;
}

const SKULL = 397;

// A skull a picker lists, worn as a helmet; Shark's "Skull Item" takes Blitz's dumped "Shark's Head" skin
function pickerSkull(text: string, kit: string) {
  if (text === "Wither Skeleton Skull") return legacyItem(SKULL, 1);
  if (text !== "Skull Item") return undefined;

  const head = items.find((item) => plain(item.name) === `${kit}'s Head`);
  if (!head) unmatched.push(`${kit}'s Skull Item, as no ${kit}'s Head was dumped`);
  return head && { ...legacyItem(SKULL, 3)!, skin: kitItem(head).skin };
}

/** The armour a picker's item list names, in its armour slots */
function pickerArmor(lore: string[], kit: string) {
  const lines = lore.map(plain);
  const armor: Record<number, ItemStack> = {};

  for (const [index, line] of lines.entries()) {
    // Blitz lists " ▪ Iron Helmet" with enchantments indented under it; SkyWars drops the bullet
    if (/^\s{2,}/.test(line)) continue;
    const text = line.replace(/^ ▪ /, "").replace(/ x\d+$/, "");
    const enchanted = /^\s{2,}[∙▪]/.test(lines[index + 1] ?? "") || undefined;

    const skull = pickerSkull(text, kit);
    if (skull) armor[ARMOR.helmet] = { ...skull, enchanted };

    const match = ARMOR_PIECE.exec(text);
    if (!match) continue;
    const material = match[1] === "Gold" ? "golden" : match[1].toLowerCase();
    const piece = match[2].toLowerCase() as keyof typeof ARMOR;
    armor[ARMOR[piece]] = { id: `minecraft:${material}_${piece}`, color: leatherColor(text), enchanted };
  }

  return Object.keys(armor).length > 0 ? armor : undefined;
}

/** Dyes the listed leather piece a picker's icon shows, when the list names no dye for it (Batguy's helmet) */
function iconDye(icon: DumpItem, pieces: ItemStack[]) {
  if (!icon.id.startsWith("minecraft:leather_")) return;
  const { id, color } = kitItem(icon);
  const piece = pieces.find((listed) => listed.id === id && listed.color === undefined);
  if (piece && color !== undefined) piece.color = color;
}

// SkyWars kit pages, each kit's lore with whether its page is Mini's
const skyWarsPages = screens
  .filter((screen) => /Choose Your Kit/.test(screen.title))
  .map((screen) => {
    const entries = pickerEntries(screen).filter((item) => item.lore.some((line) => /Click to select/.test(plain(line))));
    return { mini: entries.some((item) => plain(item.name).startsWith(SKYWARS_MINI_KIT)), entries };
  });

// A kit's item list: its lore up to the first blank line, which the selected kit's copy lacks
function itemList(lore: string[]) {
  const end = lore.findIndex((line) => plain(line) === "");
  return JSON.stringify(end === -1 ? lore : lore.slice(0, end));
}

function skyWarsGroup(name: string, lore: string[]) {
  const page = skyWarsPages.find(({ entries }) =>
    entries.some((item) => plain(item.name).replace(/ - .+$/, "") === name && itemList(item.lore) === itemList(lore)),
  );
  if (!page) throw new Error(`No SkyWars kit page lists ${name}`);
  return page.mini ? "Mini" : "Insane";
}

// SkyWars Duel's editors with their picker's lore, whose item list the lobby's kit menus share
const skyWarsDuelEditors: { key: string; lore: string[]; shown: DumpItem[] }[] = [];

for (const [title, mode] of Object.entries(KIT_EDITORS)) {
  const kits: Record<string, Kit> = {};

  for (const [index, screen] of screens.entries()) {
    if (plain(screen.title) !== title) continue;
    const kit = screens.slice(index + 1).map(selected).find(Boolean);
    // Only a picker after the editor names its kit, so a dump's last editor can't be placed
    if (!kit) {
      unnamed.add(title);
      continue;
    }

    const group = mode === "sw_duel" ? skyWarsGroup(kit.name, kit.lore) : undefined;
    const key = group ? `${group.toLowerCase()}_${kitKey(kit.name)}` : kitKey(kit.name);
    // The first screen is the default; later ones may show items the player moved
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
    if (mode === "sw_duel") skyWarsDuelEditors.push({ key, lore: kit.lore, shown: shown.map(({ item }) => item) });
  }

  if (Object.keys(kits).length === 0) {
    missing.push(title);
    continue;
  }

  // An item most kits show, like SkyWars' iron sword, is shared: its token has no kit prefix
  const counts = new Map<string, number>();
  for (const { items: kitItems } of Object.values(kits)) {
    for (const key of new Set(kitItems.map(sameItemKey))) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const half = Object.keys(kits).length / 2;
  for (const kit of Object.values(kits)) {
    kit.items = kit.items.map((entry) => {
      const { slot, material, item } = entry;
      return { slot, material, shared: counts.get(sameItemKey(entry))! > half || undefined, item };
    });
  }

  output.kits[mode] = kits;
}

const enchantmentIds = new Map(
  (await fetchJson<{ id: number; displayName: string }[]>("1.8/enchantments.json")).map(({ id, displayName }) => [displayName, id]),
);

const POTION = 373;
const SPLASH = 0x40_00;

// An enchanted book's are its StoredEnchantments, which kit layouts list too
const dumpedEnchantments = ({ nbt }: DumpItem) =>
  [...(/(?:ench|StoredEnchantments):\[([^\]]*)\]/.exec(nbt)?.[1].matchAll(/id:(\d+)s/g) ?? [])].map(([, id]) => Number(id));

const sameIds = (a: number[], b: number[]) => a.toSorted().join() === b.toSorted().join();

/** An item as a SkyWars kit layout names it, like DIAMOND_AXE:0:16: potions drop their splash and drinkable bits */
function skyWarsToken(id: number, damage: number, enchantments: number[]) {
  const material = materials.get(id);
  if (!material) throw new Error(`No Bukkit material for ${id}`);
  const ids = enchantments.toSorted((a, b) => a - b).join(",");
  return [material.toUpperCase(), id === POTION ? damage & 0x1f_ff : damage, ...(ids ? [ids] : [])].join(":");
}

const backTo = (screen: Screen) =>
  plain(screen.slots.find(({ item }) => item && plain(item.name) === "Go Back")?.item?.lore[0] ?? "").replace(/^To /, "");

// The SkyWars lobby's kit menus, Normal and Insane, Mini and Mega
const SKYWARS_MENU = /^(Normal|Insane|Mini|Mega) Kits$/;

// Each Kit Customizer by its menu and kit, from the kit's page, which goes back to its menu
const skyWarsCustomizers = new Map<string, { slot: number; item: DumpItem }[]>();

for (const [index, screen] of screens.entries()) {
  const kit = /^(.+) Kit Customizer$/.exec(plain(screen.title))?.[1];
  // A screen without its buttons was captured before it finished loading
  if (!kit || backTo(screen) !== `${kit} Kit`) continue;

  const page = screens.slice(0, index).findLast((shown) => plain(shown.title) === `${kit} Kit`);
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

/**
 * A kit menu item's list: its §7§7 lore lines up to the first blank one, each with the enchantments
 * under it. Lore lines start with §5§o, which leaves out the client's lines above them (a potion
 * icon's effects, "Dyed"), and notes like "Spawns a 4th chest" are a single §7
 */
function listedItems(lore: string[]) {
  const listed: Listed[] = [];

  for (const line of lore.filter((shown) => shown.startsWith("§5§o"))) {
    if (blank(line)) break;
    const enchantment = /^§5§o§7 {3}∙ (.+?)(?: x(\d+))?$/.exec(line);
    const text = /^§5§o§7§7([^§].*)$/.exec(line)?.[1];
    const last = listed.at(-1);

    if (enchantment && last) {
      last.enchantments.push(plain(enchantment[1]));
      // An enchanted book's count follows its enchantment
      if (enchantment[2]) last.count = Number(enchantment[2]);
    } else if (text) {
      const [, name, count] = /^(.+?)(?: x(\d+))?$/.exec(text)!;
      listed.push({ text: name, count: count ? Number(count) : undefined, enchantments: [] });
    }
  }

  return listed;
}

type Pooled = { slot?: number; item: DumpItem };

const listedEnchantments = ({ enchantments }: Listed) =>
  enchantments.map((line) => enchantmentIds.get(/^(.+) [IVXLC]+$/.exec(line)?.[1] ?? ""));

/** Dumped items with a listed item's count and enchantments */
const fitting = (listed: Listed, pool: Pooled[]) =>
  pool.filter(
    ({ item }) =>
      (item.count > 1 ? item.count : undefined) === listed.count &&
      sameIds(dumpedEnchantments(item), listedEnchantments(listed) as number[]),
  );

/** 1.8's item a listed name gives, which has no potions and none of Hypixel's own items */
function namedListed({ text }: Listed) {
  const armor = ARMOR_PIECE.exec(text);
  const egg = /^(.+) Egg$/.exec(text)?.[1];
  // 1.8 names spawn eggs like "Spawn Bat"
  return armor ? namedItem(armor[0]) : (namedItem(text) ?? (egg ? namedItem(`Spawn ${egg}`) : undefined));
}

/** The dumped item a listed one is: of its fitting ones, the one of its name or material, or for potions the only one of its kind */
function dumpedListed(listed: Listed, pool: Pooled[]) {
  const fits = fitting(listed, pool);
  const named = namedListed(listed);
  const potion = /^(Splash )?Potion of (\w+)/.exec(listed.text);
  const potions = fits.filter(({ item }) => potion && legacyId(item) === POTION && Boolean(item.damage & SPLASH) === Boolean(potion[1]));
  const described = potions.filter(({ item }) => [item.name, ...item.lore].some((line) => potion && plain(line).includes(potion[2])));

  return (
    fits.find(({ item }) => plain(item.name) === listed.text) ??
    (named && fits.find(({ item }) => legacyId(item) === named.id)) ??
    (potions.length === 1 ? potions[0] : described.length === 1 ? described[0] : undefined)
  );
}

function lobbyItem(listed: Listed, dumped?: Pooled) {
  if (dumped) {
    const id = legacyId(dumped.item);
    const token = skyWarsToken(id, dumped.item.damage, dumpedEnchantments(dumped.item));
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
  const menu = SKYWARS_MENU.exec(plain(screen.title))?.[1];
  if (!menu) continue;

  for (const entry of pickerEntries(screen)) {
    if (!entry.lore.some((line) => plain(line) === "Right-click to open breakdown!")) continue;
    const name = `${menu} ${plain(entry.name)}`;
    const key = `${menu.toLowerCase()}_${kitKey(plain(entry.name))}`;
    if (skyWarsKits[key]) continue;

    // A SkyWars Duel kit whose picker lists the same items holds them, with the mode's shared ones added
    const listed = listedItems(entry.lore);
    const duel = skyWarsDuelEditors.find(({ lore }) => JSON.stringify(listedItems(lore)) === JSON.stringify(listed));
    const pool: Pooled[] = [
      ...(skyWarsCustomizers.get(key) ??
        duel?.shown.filter((_, index) => !output.kits.sw_duel[duel.key].items[index].shared).map((item) => ({ item })) ??
        []),
    ];

    const dumped = listed.map((item) => {
      const match = dumpedListed(item, pool);
      if (match) pool.splice(pool.indexOf(match), 1);
      return match;
    });

    // The last dumped item left is the last listed one no name matched (Hypixel's Bookcase is a bookshelf)
    const left = listed.flatMap((item, index) => (dumped[index] || lobbyItem(item) ? [] : [index]));
    if (left.length === 1 && pool.length === 1 && fitting(listed[left[0]], pool).length === 1) dumped[left[0]] = pool.pop();

    // A player who never saved a layout gets the list in order, armour put on and the rest from
    // slot 0, as every Kit Customizer dumped shows
    const items: SkyWarsKit["items"] = [];
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
      const armor = Object.entries(ARMOR).find(([piece]) => material.endsWith(`_${piece}`))?.[1];
      const slot = armor ?? next++;
      if (armor !== undefined && items.some((item) => item.slot === armor)) throw new Error(`${name} lists two items for slot ${armor}`);
      if (known && found.slot !== undefined && found.slot !== slot) {
        throw new Error(`${name}'s Kit Customizer shows ${text} in slot ${found.slot}, not ${slot}`);
      }

      const same = items.find(({ token }) => token === found.token);
      if (same && JSON.stringify(same.item) !== JSON.stringify(found.item)) throw new Error(`${name} has two items stored as ${found.token}`);
      items.push({ slot, token: found.token, item: found.item });
    }

    iconDye(entry, items.map(({ item }) => item));
    skyWarsKits[key] = { name, items: known ? items : items.map(({ token, item }) => ({ token, item })) };
  }
}

if (Object.keys(skyWarsKits).length === 0) missing.push("SkyWars kit menus");

const legacyKits = { blitz: {} as Record<string, LegacyKit>, megawalls: {} as Record<string, LegacyKit> };

// Blitz names its kit items "<Kit>'s <Material> (<level>)", which a renamed item replaces with
// its new name and an Owner line
const BLITZ_ITEM_NAME = /^§f.+'s (.+) §7\([IVX]+\)$/;
const blitzMaterialNames = new Map(
  screens.flatMap((screen) =>
    screen.slots.flatMap(({ item }) => {
      const material = item && BLITZ_ITEM_NAME.exec(item.name)?.[1];
      return material ? [[item.id, material] as const] : [];
    }),
  ),
);

function withoutRename(item: DumpItem, kit: string, level: number): DumpItem {
  const lore = item.lore.filter((line) => !plain(line).startsWith("Owner: "));
  if (lore.length === item.lore.length) return item;

  const material = blitzMaterialNames.get(item.id);
  if (!material) throw new Error(`No other Blitz kit names a ${item.id}, so ${kit}'s renamed one can't be restored`);
  return { ...item, name: `§f${kit}'s ${material} §7(${ROMAN[level - 1]})`, lore };
}

/** The Blitz level an Upgrades page shows unlocked, or the Kit upgrade a Mega Walls class page shows */
function legacyKitLevel(page: Screen, game: keyof typeof legacyKits, kit: string) {
  const entries = pickerEntries(page);

  if (game === "blitz") {
    const unlocked = entries.flatMap((item) => {
      const level = ROMAN.indexOf(new RegExp(`^${kit} ([IVX]+)$`).exec(plain(item.name))?.[1] ?? "") + 1;
      return level > 0 && item.lore.some((line) => plain(line) === "UNLOCKED") ? [level] : [];
    });
    if (unlocked.length === 0) throw new Error(`${page.title} shows no unlocked level`);
    return { level: Math.max(...unlocked) };
  }

  const upgrade = entries.find((item) => plain(item.name) === `Kit - ${kit}`);
  const tier = upgrade?.lore.map((line) => /^Tier: ([IVX]+)$/.exec(plain(line))?.[1]).find(Boolean);
  if (!upgrade || !tier) throw new Error(`${page.title} shows no Kit tier`);
  return { level: ROMAN.indexOf(tier) + 1, armor: pickerArmor(upgrade.lore, kit) };
}

for (const [index, screen] of screens.entries()) {
  const kit = /^Edit (.+) Layout$/.exec(plain(screen.title))?.[1];
  const page = /^(.+) (Upgrades|Class)$/.exec(backTo(screen));
  // A screen without its buttons was captured before it finished loading
  if (!kit || !page || page[1] !== kit) continue;

  const game = LEGACY_KIT_PAGES[page[2] as keyof typeof LEGACY_KIT_PAGES];
  const key = kitKey(kit);
  // The first screen is the default; later ones may show items the player moved
  if (legacyKits[game][key]) continue;

  const pageTitle = `${kit} ${page[2]}`;
  const shownPage = screens.slice(0, index).findLast((shown) => plain(shown.title) === pageTitle);
  if (!shownPage) throw new Error(`No ${pageTitle} page before ${screen.title}`);
  const { level, armor } = legacyKitLevel(shownPage, game, kit);

  const items = editorItems(screen)
    .map(({ slot, item }) => {
      const shown = game === "blitz" ? withoutRename(item, kit, level) : item;
      const numeric = legacyId(shown);
      return { slot, token: `${numeric},${shown.damage}`, item: kitItem(shown, numeric) };
    })
    .toSorted((a, b) => a.slot - b.slot);

  // Stored layouts name items only by token
  const tokens = items.map(({ token }) => token);
  if (new Set(tokens).size < tokens.length) throw new Error(`${screen.title} shows two items of one token`);

  legacyKits[game][key] = {
    name: kit,
    level,
    items,
    armor,
    saved: SAVED_LAYOUTS[game].includes(kit) || undefined,
  };
}

// Each Blitz kit's armour at levels I to X, from its Upgrades page. The page names few dyes, so
// leather takes the colour its editor shows on that piece, where one was dumped
const blitzArmor: Record<string, Record<number, ItemStack>[]> = {};

for (const screen of screens) {
  const kit = /^(.+) Upgrades$/.exec(plain(screen.title))?.[1];
  if (!kit) continue;
  const key = kitKey(kit);

  for (const entry of pickerEntries(screen)) {
    const tier = ROMAN.indexOf(new RegExp(`^${kit} ([IVX]+)$`).exec(plain(entry.name))?.[1] ?? "");
    if (tier === -1 || blitzArmor[key]?.[tier]) continue;

    const armor = pickerArmor(entry.lore, kit) ?? {};
    for (const piece of Object.values(armor)) {
      piece.color ??= legacyKits.blitz[key]?.items.find(({ item }) => item.id === piece.id)?.item.color;
    }
    (blitzArmor[key] ??= [])[tier] = armor;
  }
}

for (const [kit, levels] of Object.entries(blitzArmor)) {
  if (!ROMAN.every((_, tier) => levels[tier])) throw new Error(`${kit}'s Upgrades page misses a level`);
}

/** Whether a screen is a menu that finished loading (it shows Go Back), by its title and the page it goes back to */
const isMenu = (shown: Screen, title: string, back?: string) =>
  plain(shown.title) === title &&
  shown.slots.some(
    ({ item }) => item && plain(item.name) === "Go Back" && (back === undefined || plain(item.lore[0] ?? "") === `To ${back}`),
  );

/** A menu's first screen that finished loading */
function menuScreen(title: string, back?: string) {
  const index = screens.findIndex((shown) => isMenu(shown, title, back));
  if (index === -1) missing.push(back ? `${back} > ${title}` : title);
  return index;
}

/** A menu's items without its buttons */
function menu(title: string, back?: string) {
  const screen = screens[menuScreen(title, back)];
  if (!screen) return [];

  return pickerEntries(screen).filter(
    (item) => !/^(Go Back|Close|Reset .+|Left-click for (next|previous) page!|.+ Coins: .+)$/.test(plain(item.name)),
  );
}

// What a menu shows about the dumping account rather than the item: how to get it, whether it's
// selected, and the menu's prompt. Requirements continue on indented lines
const MENU_STATUS =
  /^(Click to (select|purchase|view)!|> Click to activate! <|>>> ACTIVE <<<|SELECTED!|Equipped!|Missing parts!|Cost: .+|Unlocked in .+|[✖✔] .+|Choose an? .+!|Collect all the hats!)$/;

/**
 * A menu item as a loadout shows it: without the account's status lines, and, where the menu
 * colours names by whether the account owns or picked them, named in the selected item's green.
 * The selected item's glint is the menu's too, so only real enchantments glint
 */
function menuItem(dumped: DumpItem, recolor: boolean): ItemStack {
  const item = kitItem(dumped);
  const tooltip: string[] = [];
  let dropping = false;

  for (const line of dumped.lore) {
    const text = plain(line).trim();
    dropping = MENU_STATUS.test(text) || (dropping && /^\s/.test(plain(line)) && text !== "");
    if (dropping || (blank(line) && (tooltip.length === 0 || blank(tooltip.at(-1)!)))) continue;
    tooltip.push(line);
  }
  while (tooltip.length > 0 && blank(tooltip.at(-1)!)) tooltip.pop();

  return {
    ...item,
    name: recolor ? dumped.name.replace(/^§[ac7]/, "§a") : dumped.name,
    tooltip: tooltip.length > 0 ? tooltip : undefined,
    enchanted: /ench:\[\d/.test(dumped.nbt) || undefined,
  };
}

/** Items by key, throwing if two share one */
function byKey(entries: [string, ItemStack][], where: string) {
  const keyed: Record<string, ItemStack> = {};
  for (const [key, item] of entries) {
    if (keyed[key]) throw new Error(`${where} has two items keyed ${key}`);
    keyed[key] = item;
  }
  return keyed;
}

// Quake's shop menus, by the stats key each one's pick is stored under. The Laser is "sight"
// and the Kits menu's chestplates "armor"; the hat is worn as the helmet
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

const DIGITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

/** The key a Quake part's stored id gives once fromQuakeLoadout trims it */
function quakeKey(part: (typeof QUAKE_MENUS)[number][0], item: DumpItem) {
  const name = plain(item.name);

  // Triggers are stored spelled out: 0.85s is ZERO_POINT_EIGHT_FIVE
  if (part === "trigger") {
    const time = /^(\d+\.\d+)s/.exec(name)?.[1];
    if (!time) throw new Error(`Quake trigger ${name} names no time`);
    return [...time].map((char) => (char === "." ? "point" : DIGITS[Number(char)])).join("");
  }

  // Cases are stored by Bukkit material, with SHINY_ for the Power X ones (SHINY_DIAMOND_HOE)
  if (part === "case") {
    const material = materials.get(legacyId(item));
    if (!material) throw new Error(`No Bukkit material for ${item.id}`);
    return kitKey(`${/ench:\[\d/.test(item.nbt) ? "shiny" : ""}${material}`);
  }

  return kitKey(name.replace(/ \S+$/, ""));
}

const quake: Record<string, Record<string, ItemStack>> = {};

for (const [part, title, back] of QUAKE_MENUS) {
  const entries = menu(title, back).flatMap((item): [string, ItemStack][] =>
    // The axe cases' ids aren't their Bukkit material (packages hold case.wooden_axe), so they can't be matched
    part === "case" && item.id.endsWith("_axe") ? [] : [[quakeKey(part, item), menuItem(item, true)]],
  );
  quake[part] = byKey([...Object.entries(quake[part] ?? {}), ...entries], `Quake ${title}`);
}

// Arena's skill menus by the stats key of each slot
const ARENA_SKILLS = {
  offensive: "Offensive Skills",
  utility: "Utility Skills",
  support: "Support Skills",
  ultimate: "Ultimate Skills",
} as const;

const arena: Record<string, Record<string, ItemStack>> = {};

for (const [slot, title] of Object.entries(ARENA_SKILLS)) {
  arena[slot] = byKey(
    menu(title).map((item) => [kitKey(plain(item.name)), menuItem(item, true)]),
    `Arena ${title}`,
  );
}

// Each rune's row starts with the rune and goes on with its upgrades (Rune of Speed II). Its
// description gives the first level's chance, and the stored rune_level_<rune> isn't known to
// count from it, so the rune keeps only its name
arena.active_rune = byKey(
  menu("Runes").flatMap((item): [string, ItemStack][] => {
    const rune = /^Rune of ([A-Za-z]+)$/.exec(plain(item.name))?.[1];
    return rune ? [[kitKey(rune), { ...menuItem(item, false), tooltip: undefined }]] : [];
  }),
  "Arena Runes",
);

// TKR's part selectors by the PartType their parts are stored with
const KART_SELECTORS = { ENGINE: "Engine Selector", TURBOCHARGER: "Turbocharger Selector", FRAME: "Frame Selector" } as const;

const kart: Record<string, KartPart[]> = {};

for (const [type, title] of Object.entries(KART_SELECTORS)) {
  const parts: KartPart[] = [];
  const suffix = title.replace(/^(\w+) Selector$/, " $1");

  // A selector lists only the parts the dumping account owns, so a later screen can show more
  const shown = screens.filter((screen) => isMenu(screen, title)).flatMap(pickerEntries);
  for (const item of shown.filter((item) => plain(item.name).endsWith(suffix))) {
    // Named <name> <rarity> <type>, like Eternal Awesome Engine
    const rarity = plain(item.name).split(" ").at(-2)!.toUpperCase();
    // Each attribute's bar is five >, green up to its level: §a>§a>§4>§4>§4>§r  Top speed
    const attributes = Object.fromEntries(
      item.lore.flatMap((line) => {
        const name = /^>+\s+(.+)$/.exec(plain(line))?.[1];
        return name ? [[name.toUpperCase().replaceAll(" ", "_"), line.match(/§a>/g)?.length ?? 0]] : [];
      }),
    );

    const part = { rarity, attributes, item: kitItem(item) };
    if (!parts.some((shown) => JSON.stringify(shown) === JSON.stringify(part))) parts.push(part);
  }

  if (parts.length > 0) kart[type] = parts;
  else missing.push(title);
}

// The Speed UHC Shop's Kits page lists each kit's items by name, like "Stick x2", with
// enchantments on indented lines under them
const speedUhc: Record<string, Record<string, (ItemStack | null)[]>> = {};

/** A Speed UHC kit's items, null where a name can't be matched */
function speedUhcKit(kit: DumpItem) {
  const items: (ItemStack | null)[] = [];

  // The client adds the icon's own enchantments above the lore, whose lines start with §5§o.
  // The list ends at the first blank line
  const lines = kit.lore.filter((line) => line.startsWith("§5§o"));
  const end = lines.findIndex(blank);

  for (const line of lines.slice(0, end === -1 ? undefined : end)) {
    const enchantment = /^\s+∙ (.+)$/.exec(plain(line))?.[1];
    const last = items.at(-1);
    if (enchantment) {
      if (last) Object.assign(last, { enchanted: true, tooltip: [...(last.tooltip ?? []), enchantment] });
      continue;
    }

    const [, name, count] = /^(.+?)(?: x(\d+))?$/.exec(plain(line))!;
    const named = namedItem(name);
    const item = named && legacyItem(named.id, named.damage);
    if (!item) unmatched.push(`Speed UHC ${plain(kit.name)}'s ${name}`);
    items.push(item ? { ...item, count: count ? Number(count) : undefined } : null);
  }

  return items;
}

const kitsPage = menuScreen("Kits", "Speed UHC Shop");

if (kitsPage !== -1) {
  // The shop's Kits item names the mode its page is for: "Selection of unique kits for Normal Mode."
  const mode = screens
    .slice(0, kitsPage)
    .filter((screen) => plain(screen.title) === "Speed UHC Shop")
    .flatMap(pickerEntries)
    .findLast((item) => plain(item.name) === "Kits")
    ?.lore.map(plain)
    .join(" ")
    .match(/kits for (\w+) Mode/)?.[1];
  if (!mode) throw new Error("No Speed UHC Shop before its Kits page names the mode");

  speedUhc[mode.toLowerCase()] = Object.fromEntries(
    menu("Kits", "Speed UHC Shop").map((kit) => [kitKey(plain(kit.name)), speedUhcKit(kit)]),
  );
}

// The shop leaves out the free Default kit, which only the Gear Selector in a game lists (Speed UHC
// only has Normal games)
const gearSelector = screens.find((screen) => plain(screen.title) === "Gear Selector");
const defaultKit = gearSelector && pickerEntries(gearSelector).find((item) => plain(item.name) === "Default");
if (defaultKit && speedUhc.normal) speedUhc.normal.default = speedUhcKit(defaultKit);

const count = (menus: Record<string, object>) => Object.values(menus).reduce((sum, items) => sum + Object.keys(items).length, 0);

/** Writes a data file, unless these dumps had nothing for it */
async function writeData(file: string, found: boolean, value: unknown) {
  if (found) await writeFile(new URL(`../data/${file}`, import.meta.url), `${JSON.stringify(value, null, 2)}\n`);
}

await writeData("duels-modes.json", Object.keys(output.modes).length > 0 || Object.keys(output.kits).length > 0, output);
await writeData("tnt-games.json", Object.keys(tntGames).length > 0, tntGames);
await writeData("legacy-kits.json", count(legacyKits) > 0, { ...legacyKits, blitzArmor });
await writeData("skywars-kits.json", Object.keys(skyWarsKits).length > 0, skyWarsKits);
await writeData("quake.json", count(quake) > 0, quake);
await writeData("arena.json", count(arena) > 0, arena);
await writeData("turbo-kart-racers.json", count(kart) > 0, kart);
await writeData("speed-uhc.json", count(speedUhc) > 0, speedUhc);

console.log(
  `${Object.keys(output.modes).length} Duels modes, ${Object.keys(tntGames).length} TNT Games modes; kits: ${Object.entries(output.kits)
    .map(([mode, kits]) => `${mode} ${Object.keys(kits).length}`)
    .join(", ")}, blitz ${Object.keys(legacyKits.blitz).length}, megawalls ${Object.keys(legacyKits.megawalls).length}, SkyWars ${Object.keys(skyWarsKits).length}` +
    `; Quake ${count(quake)} items, Arena ${count(arena)}, TKR ${count(kart)} parts, Speed UHC ${count(speedUhc)} kits` +
    (missing.length > 0 ? `; not in these dumps: ${missing.join(", ")}` : "") +
    (unnamed.size > 0 ? `; skipped the last screens of ${[...unnamed].join(", ")}, which no picker follows` : "") +
    (unmatched.length > 0 ? `; left out ${unmatched.join(", ")}, whose names match no item` : ""),
);
