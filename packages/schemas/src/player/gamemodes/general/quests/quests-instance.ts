/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ArcadeQuests,
  ArenaBrawlQuests,
  BedWarsQuests,
  BlitzSGQuests,
  BuildBattleQuests,
  CopsAndCrimsQuests,
  DuelsQuests,
  MegaWallsQuests,
  MurderMysteryQuests,
  PaintballQuests,
} from "./modes";
import { QuestMode, QuestTime, createQuestsInstance } from "./util";

const modes: QuestMode[] = [
  ["ARCADE", ArcadeQuests],
  ["ARENA_BRAWL", ArenaBrawlQuests],
  ["BEDWARS", BedWarsQuests],
  ["BLITZSG", BlitzSGQuests],
  ["BUILD_BATTLE", BuildBattleQuests],
  ["DUELS", DuelsQuests],
  ["COPS_AND_CRIMS", CopsAndCrimsQuests],
  ["MEGAWALLS", MegaWallsQuests],
  ["MURDER_MYSTERY", MurderMysteryQuests],
  ["PAINTBALL", PaintballQuests],
];

export const OverallQuests = createQuestsInstance(QuestTime.Overall, modes);
