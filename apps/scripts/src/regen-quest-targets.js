/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Regenerates packages/schemas/src/player/gamemodes/quests/objective-targets.generated.ts
 * from the live Hypixel quests resource, and prints a drift report comparing:
 *   1. Local quest ids missing from the Hypixel resource
 *   2. Hypixel quest ids missing from our local schema
 *   3. Objective target changes (committed map value ≠ live resource value)
 *   4. Suspicious id near-mismatches (local vs Hypixel)
 *
 * Usage: pnpm scripts quests:regen
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { config } from "@statsify/util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, "../../../");
const MODES_DIR = join(MONOREPO_ROOT, "packages/schemas/src/player/gamemodes/quests/modes");
const GENERATED_FILE = join(MONOREPO_ROOT, "packages/schemas/src/player/gamemodes/quests/objective-targets.generated.ts");

// ---------------------------------------------------------------------------
// Step 1: Parse local quest ids from mode files
// ---------------------------------------------------------------------------

function parseLocalQuestIds() {
  const localIds = new Set();

  const files = readdirSync(MODES_DIR).filter((f) => f.endsWith(".ts") && f !== "index.ts");

  for (const file of files) {
    const content = readFileSync(join(MODES_DIR, file), "utf8");

    const prefixMatch = /fieldPrefix:\s*"([^"]+)"/.exec(content);
    const fieldPrefix = prefixMatch?.[1];

    for (const match of content.matchAll(/field:\s*"([^"]+)"/g)) {
      const field = match[1];
      localIds.add(fieldPrefix ? `${fieldPrefix}_${field}` : field);
    }
  }

  return localIds;
}

// ---------------------------------------------------------------------------
// Step 2: Fetch live Hypixel quests resource
// ---------------------------------------------------------------------------

async function fetchHypixelQuests(apiKey) {
  const res = await fetch("https://api.hypixel.net/v2/resources/quests", {
    headers: { "API-Key": apiKey },
  });

  if (!res.ok) throw new Error(`Hypixel API returned ${res.status}: ${await res.text()}`);

  const json = await res.json();
  if (!json.success) throw new Error(`Hypixel API error: ${JSON.stringify(json)}`);

  return json.quests;
}

// ---------------------------------------------------------------------------
// Step 3: Build new objective-targets map from live resource
// ---------------------------------------------------------------------------

function buildTargetsMap(hypixelQuests) {
  const entries = Object.values(hypixelQuests)
    .flat()
    .map((quest) => {
      const objectives = Object.fromEntries(
        quest.objectives
          .filter((o) => typeof o.integer === "number")
          .map((o) => [o.id, o.integer])
      );
      return [quest.id, objectives];
    });

  entries.sort((a, b) => a[0].localeCompare(b[0]));
  return Object.fromEntries(entries);
}

// ---------------------------------------------------------------------------
// Step 4: Parse existing generated file for comparison
// ---------------------------------------------------------------------------

function parseExistingTargets() {
  try {
    const content = readFileSync(GENERATED_FILE, "utf8");
    const match = /QUEST_OBJECTIVE_TARGETS[^=]+=\s*(\{[\s\S]*?\});/.exec(content);
    if (!match) return {};
    // Safe eval of the plain object literal (no imports, no functions)
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Step 5: Generate file content
// ---------------------------------------------------------------------------

function buildFileContent(targetsMap) {
  const formatNumber = (n) => n >= 10_000 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "_") : String(n);

  const lines = Object.entries(targetsMap).map(([id, objectives]) => {
    const objEntries = Object.entries(objectives);
    if (objEntries.length === 0) return `  ${id}: {},`;
    const objStr = objEntries.map(([k, v]) => `${k}: ${formatNumber(v)}`).join(", ");
    return `  ${id}: { ${objStr} },`;
  });

  return [
    "/**",
    " * Copyright (c) Statsify",
    " *",
    " * This source code is licensed under the GNU GPL v3 license found in the",
    " * LICENSE file in the root directory of this source tree.",
    " * https://github.com/Statsify/statsify/blob/main/LICENSE",
    " */",
    "",
    "// @generated — do NOT edit manually.",
    "// Run `pnpm scripts quests:regen` to regenerate from the live Hypixel resource.",
    "// Shape: { [hypixelQuestId]: { [objectiveId]: target } }",
    "",
    "export const QUEST_OBJECTIVE_TARGETS: Record<string, Record<string, number>> = {",
    ...lines,
    "};",
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Step 6: Drift report
// ---------------------------------------------------------------------------

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function printDriftReport(localIds, newTargets, existingTargets) {
  const hypixelIds = new Set(Object.keys(newTargets));
  const localArr = [...localIds].sort();
  const hypixelArr = [...hypixelIds].sort();

  let issues = 0;

  // Category 1: local ids missing from Hypixel
  const missingFromHypixel = localArr.filter((id) => !hypixelIds.has(id));
  if (missingFromHypixel.length > 0) {
    console.log(`\n[1] Local quest ids NOT found in the Hypixel resource (${missingFromHypixel.length}):`);
    for (const id of missingFromHypixel) console.log(`    - ${id}`);
    issues += missingFromHypixel.length;
  }

  // Category 2: Hypixel ids missing from local schema
  const missingFromLocal = hypixelArr.filter((id) => !localIds.has(id));
  if (missingFromLocal.length > 0) {
    console.log(`\n[2] Hypixel quest ids NOT tracked in our local schema (${missingFromLocal.length}):`);
    for (const id of missingFromLocal) console.log(`    + ${id}`);
    issues += missingFromLocal.length;
  }

  // Category 3: objective target changes
  const changes = [];
  for (const id of Object.keys(newTargets)) {
    if (!(id in existingTargets)) continue;
    const oldObj = existingTargets[id];
    const newObj = newTargets[id];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    for (const k of allKeys) {
      if (oldObj[k] !== newObj[k]) {
        changes.push({ id, key: k, old: oldObj[k], next: newObj[k] });
      }
    }
  }
  if (changes.length > 0) {
    console.log(`\n[3] Objective target changes (${changes.length}):`);
    for (const c of changes) {
      console.log(`    ~ ${c.id} / ${c.key}: ${c.old} → ${c.next}`);
    }
    issues += changes.length;
  }

  // Category 4: near-mismatches (edit distance ≤ 5, or one id is contained within the other)
  const nearMatches = [];
  for (const localId of missingFromHypixel) {
    const candidates = hypixelArr
      .map((hId) => ({ hId, dist: levenshtein(localId, hId) }))
      .filter(({ hId, dist }) => dist <= 5 || localId.includes(hId) || hId.includes(localId))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
    if (candidates.length > 0) nearMatches.push({ localId, candidates });
  }
  if (nearMatches.length > 0) {
    console.log(`\n[4] Suspicious near-mismatches (local ≈ Hypixel):`);
    for (const { localId, candidates } of nearMatches) {
      const suggestions = candidates.map(({ hId, dist }) => `${hId} (dist=${dist})`).join(", ");
      console.log(`    ? ${localId}  →  ${suggestions}`);
    }
  }

  if (issues === 0 && changes.length === 0) {
    console.log("\n✓ No drift detected — generated map is current.");
  } else {
    console.log(`\n⚠  Drift detected: ${issues} issue(s) found. Review and update the schema or re-run after Hypixel fixes.`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const apiKey = await config("hypixelApi.key");

console.log("Parsing local quest ids from mode files...");
const localIds = parseLocalQuestIds();
console.log(`  Found ${localIds.size} local quest ids.`);

console.log("Fetching Hypixel quests resource...");
const hypixelQuests = await fetchHypixelQuests(apiKey);
const totalHypixelQuests = Object.values(hypixelQuests).flat().length;
console.log(`  Found ${totalHypixelQuests} quests across ${Object.keys(hypixelQuests).length} games.`);

const existingTargets = parseExistingTargets();
const newTargets = buildTargetsMap(hypixelQuests);

console.log("\n--- Drift Report ---");
printDriftReport(localIds, newTargets, existingTargets);

const newContent = buildFileContent(newTargets);
writeFileSync(GENERATED_FILE, newContent, "utf8");
console.log(`\nWrote ${Object.keys(newTargets).length} quest entries to ${GENERATED_FILE}`);
