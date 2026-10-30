/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Pulls NEU-REPO at one commit and writes the parts @statsify/skyblock reads to src/generated/. Builds and the
// runtime never fetch it, so run it by hand and commit the output: node scripts/sync-data.ts <full commit sha>
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { RARITIES } from "#types";
import { removeFormatting } from "@statsify/util";
import { skinHash } from "#textures";
import { tmpdir } from "node:os";
import { toLevelCosts } from "#leveling";

const REPO = "NotEnoughUpdates/NotEnoughUpdates-REPO";
const HYPIXEL_SKILLS = "https://api.hypixel.net/v2/resources/skyblock/skills";

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
  const { sblevel_colours } = await readJson<{ sblevel_colours: Record<string, string> }>("constants/sblevels.json");
  await write("leveling.json", {
    catacombs: leveling.catacombs,
    HOTM: leveling.HOTM,
    leveling_caps: leveling.leveling_caps,
    leveling_xp: xpTable("COMBAT"),
    max_levels: Object.fromEntries(Object.entries(skills).map(([id, { maxLevel }]) => [id.toLowerCase(), maxLevel])),
    runecrafting_xp: xpTable("RUNECRAFTING"),
    sblevel_colours,
    // NEU copies Revenant's 15 XP for Tarantula level 2; the game asks 25.
    slayer_xp: { ...slayerXp, spider: slayerXp.spider.with(1, 25) },
    slayer_to_highest_tier: leveling.slayer_to_highest_tier,
    social: xpTable("SOCIAL"),
  });

  const pets = await readJson<Record<string, unknown>>("constants/pets.json");
  const offsets = pets.pet_rarity_offset as Record<string, number>;
  await write("pets.json", {
    custom_pet_leveling: pets.custom_pet_leveling,
    id_to_display_name: pets.id_to_display_name,
    pet_levels: pets.pet_levels,
    // NEU levels SPECIAL pets on Epic's table; the game uses Legendary's.
    pet_rarity_offset: { ...offsets, SPECIAL: offsets.LEGENDARY },
  });

  const hotm = await readJson<{ hotm: { perks: Record<string, Record<string, unknown>> } }>("constants/hotmlayout.json");
  await write(
    "hotmlayout.json",
    Object.fromEntries(
      Object.entries(hotm.hotm.perks).map(([id, { name, x, y, maxLevel, powder }]) => [
        id,
        { name, x, y, maxLevel, powder },
      ])
    )
  );

  // Accessory id → its tier's rank, and NEU's per-variant ids (an Abicase model, a party hat color) → the API's one id.
  const accessoryRanks = new Map<string, number>();
  const apiIds = new Map<string, string>();
  const petTextures: Record<string, Record<string, string>> = {};
  const skinTextures: Record<string, string> = {};
  const files = (await readdir(join(dir, "items"))).filter((file) => file.endsWith(".json"));
  const items = await Promise.all(files.map((file) => readJson<NeuItem>(join("items", file))));

  for (const item of items) {
    // Pets are "<TYPE>;<tier>" with a petInfo tag, the tier indexing RARITIES (Phoenix only comes as SPECIAL and
    // VERY_SPECIAL); skins are PET_SKIN_<SKIN>
    const pet = item.nbttag.includes("petInfo") ? /^(.+);(\d)$/.exec(item.internalname) : null;
    const hash = pet && skullHash(item.nbttag);
    if (pet && hash) (petTextures[pet[1]] ??= {})[RARITIES[Number(pet[2])]] = hash;

    const skin = item.internalname.startsWith("PET_SKIN_") && skullHash(item.nbttag);
    if (skin) skinTextures[item.internalname.slice("PET_SKIN_".length)] = skin;

    // "§6§lLEGENDARY ACCESSORY", "§9§lRARE DUNGEON ACCESSORY", "§5§lEPIC HATCESSORY"
    const kind = /^(.+?)(?: DUNGEON)? (?:ACCESSORY|HATCESSORY)$/.exec(removeFormatting(item.lore?.at(-1) ?? "").trim());
    if (!kind) continue;

    accessoryRanks.set(item.internalname, RARITIES.findIndex((rarity) => rarity === kind[1].replaceAll(" ", "_")));
    const variant = /(?:model|party_hat_color|party_hat_emoji):"([^"]+)"/.exec(item.nbttag)?.[1];
    if (variant) apiIds.set(item.internalname, item.internalname.replace(`_${variant.toUpperCase()}`, ""));
  }

  await write("pet-textures.json", { pets: petTextures, skins: skinTextures });

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

  await write("source.json", {
    repo: `https://github.com/${REPO}`,
    sha,
    skills: { url: HYPIXEL_SKILLS, version: skillsVersion },
    syncedAt: new Date().toISOString(),
  });
  const license = await readFile(join(dir, "LICENSE"), "utf8");
  await writeFile(
    new URL("NOTICE.md", out),
    `The skill XP tables in leveling.json come from Hypixel's SkyBlock skills resource (${HYPIXEL_SKILLS}), version ${skillsVersion}.\n\nThe other JSON files here are derived from NEU-REPO (https://github.com/${REPO}) at ${sha}, under its MIT license:\n\n${license}`
  );

  console.log(
    `synced ${sha}: ${upgrades.size} upgradable accessories, ${Object.keys(petTextures).length} pet textures, ${Object.keys(skinTextures).length} pet skins`
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
