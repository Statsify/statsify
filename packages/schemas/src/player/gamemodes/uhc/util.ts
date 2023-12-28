/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { findScoreIndex } from "@statsify/util";

export const titleScores = [
	{ req: 0, title: "Recruit" },
	{ req: 10, title: "Initiate" },
	{ req: 60, title: "Soldier" },
	{ req: 210, title: "Sergeant" },
	{ req: 460, title: "Knight" },
	{ req: 960, title: "Captain" },
	{ req: 1710, title: "Centurion" },
	{ req: 2710, title: "Gladiator" },
	{ req: 5210, title: "Warlord" },
	{ req: 10_210, title: "Champion" },
	{ req: 13_210, title: "Champion" },
	{ req: 16_210, title: "Champion" },
	{ req: 19_210, title: "Champion" },
	{ req: 22_210, title: "Champion" },
	{ req: 25_210, title: "High Champion" },
];

export const getLevelIndex = (score: number): number => findScoreIndex(titleScores, score);
