/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Builds never fetch NEU-REPO, so run this by hand and commit src/generated/.
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
const SYNC_TIMEOUT = 60_000;

const sha = process.argv[2] ?? "";
if (!/^[\da-f]{40}$/.test(sha)) {
  throw new Error("usage: node scripts/sync-data.ts <full commit sha>");
}

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

const write = (file: string, data: unknown) =>
  writeFile(new URL(file, out), `${JSON.stringify(sorted(data), null, 2)}\n`);

const skullHash = (nbt: string) => {
  const value = /Value:"([\w+/=]+)"/.exec(nbt)?.[1];
  return value && skinHash(value);
};

try {
  // NEU's Runecrafting table is wrong at five levels, so skills use Hypixel's.
  const [response, skillsResponse] = await Promise.all([
    fetch(`https://codeload.github.com/${REPO}/tar.gz/${sha}`, {
      signal: AbortSignal.timeout(SYNC_TIMEOUT),
    }),
    fetch(HYPIXEL_SKILLS, { signal: AbortSignal.timeout(SYNC_TIMEOUT) }),
  ]);
  if (!response.ok) throw new Error(`codeload answered ${response.status}`);
  await writeFile(
    join(dir, "repo.tar.gz"),
    Buffer.from(await response.arrayBuffer()),
  );
  execFileSync("tar", ["-xzf", "repo.tar.gz", "--strip-components=1"], {
    cwd: dir,
  });

  if (!skillsResponse.ok)
    throw new Error(`${HYPIXEL_SKILLS} answered ${skillsResponse.status}`);
  const { skills, version: skillsVersion } = (await skillsResponse.json()) as {
    skills: Record<string, HypixelSkill>;
    version: string;
  };
  const xpTable = (skill: string) =>
    toLevelCosts(
      skills[skill].levels.map(({ totalExpRequired }) => totalExpRequired),
    );

  const leveling = await readJson<Record<string, unknown>>(
    "constants/leveling.json",
  );
  const slayerXp = leveling.slayer_xp as Record<string, number[]>;
  const { core_task, sblevel_colours } = await readJson<{
    core_task: Record<string, unknown>;
    sblevel_colours: Record<string, string>;
  }>("constants/sblevels.json");
  await write("leveling.json", {
    catacombs: leveling.catacombs,
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

  const pets = await readJson<Record<string, unknown>>("constants/pets.json");
  const offsets = pets.pet_rarity_offset as Record<string, number>;
  await write("pets.json", {
    custom_pet_leveling: pets.custom_pet_leveling,
    id_to_display_name: pets.id_to_display_name,
    pet_levels: pets.pet_levels,
    // NEU levels SPECIAL pets on Epic's table, but the game uses Legendary's.
    pet_rarity_offset: { ...offsets, SPECIAL: offsets.LEGENDARY },
  });

  await write("sblevels.json", {
    core_task: {
      accessory_bag_xp: core_task.accessory_bag_xp,
      pet_score_xp: core_task.pet_score_xp,
    },
  });

  const hotm = await readJson<{
    hotm: { perks: Record<string, Record<string, unknown>> };
  }>("constants/hotmlayout.json");
  await write(
    "hotmlayout.json",
    Object.fromEntries(
      Object.entries(hotm.hotm.perks).map(([id, { name, x, y, maxLevel }]) => [
        id,
        { name, x, y, maxLevel },
      ]),
    ),
  );

  const accessoryRanks = new Map<string, number>();
  // NEU gives each Abicase model and party hat color its own id.
  const apiIds = new Map<string, string>();
  const petTextures: Record<string, Record<string, string>> = {};
  const skinTextures: Record<string, string> = {};
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

    const skin =
      item.internalname.startsWith("PET_SKIN_") && skullHash(item.nbttag);
    if (skin) skinTextures[item.internalname.slice("PET_SKIN_".length)] = skin;

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

  await write("pet-textures.json", { pets: petTextures, skins: skinTextures });

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

  await write("accessories.json", {
    ignored: [...new Set(misc.ignored_talisman.map(api))].toSorted(),
    upgrades: Object.fromEntries(
      [...upgrades].map(([id, ids]) => [id, [...ids].toSorted()]),
    ),
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
    `The skill XP tables in leveling.json come from Hypixel's SkyBlock skills resource (${HYPIXEL_SKILLS}), version ${skillsVersion}.\n\nThe other JSON files here are derived from NEU-REPO (https://github.com/${REPO}) at ${sha}, under its MIT license:\n\n${license}`,
  );

  console.log(
    `synced ${sha}: ${upgrades.size} upgradable accessories, ${Object.keys(petTextures).length} pet textures, ${Object.keys(skinTextures).length} pet skins`,
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
