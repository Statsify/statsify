/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { writeFileSync } from "node:fs";

const response = await fetch("https://api.hypixel.net/v2/resources/quests");
if (!response.ok) throw new Error(`Failed to fetch quests: ${response.status}`);

const { quests } = await response.json();

const targets = Object.values(quests)
  .flat()
  .filter(({ objectives }) => objectives.length === 1 && objectives[0].type === "IntegerObjective")
  .map(({ id, objectives: [objective] }) => [id, objective.integer])
  .sort(([a], [b]) => a.localeCompare(b));

writeFileSync(
  "../../packages/schemas/src/player/gamemodes/quests/objective-targets.json",
  `${JSON.stringify(Object.fromEntries(targets), null, 2)}\n`
);

console.log(`Wrote ${targets.length} quest targets`);
