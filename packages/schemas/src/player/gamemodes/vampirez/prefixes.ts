/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GamePrefix, rainbow } from "#prefixes";

export const humanPrefixes: GamePrefix[] = [
	{ fmt: (n) => `§8[${n}]`, req: 0 },
	{ fmt: (n) => `§7[${n}]`, req: 20 },
	{ fmt: (n) => `§f[${n}]`, req: 50 },
	{ fmt: (n) => `§6[${n}]`, req: 100 },
	{ fmt: (n) => `§e[${n}]`, req: 150 },
	{ fmt: (n) => `§2[${n}]`, req: 200 },
	{ fmt: (n) => `§a[${n}]`, req: 250 },
	{ fmt: (n) => `§5[${n}]`, req: 300 },
	{ fmt: (n) => `§d[${n}]`, req: 500 },
	{ fmt: (n) => `§1[${n}]`, req: 750 },
	{ fmt: (n) => `§1§l[${n}]`, req: 1000 },
	{ fmt: (n) => `§9§l[${n}]`, req: 1500 },
	{ fmt: (n) => `§3§l[${n}]`, req: 2000 },
	{ fmt: (n) => `§b§l[${n}]`, req: 2500 },
	{ fmt: (n) => `§c§l[${n}]`, req: 3000 },
	{ fmt: (n) => `§4§l[${n}]`, req: 5000 },
	{ fmt: (n) => `§0§l[${n}]`, req: 10_000 },
	{ fmt: (n) => rainbow(`[${n}]`), req: 15_000 },
];

export const vampirePrefixes: GamePrefix[] = [
	{ fmt: (n) => `§8[${n}]`, req: 0 },
	{ fmt: (n) => `§f[${n}]`, req: 50 },
	{ fmt: (n) => `§e[${n}]`, req: 100 },
	{ fmt: (n) => `§a[${n}]`, req: 250 },
	{ fmt: (n) => `§d[${n}]`, req: 500 },
	{ fmt: (n) => `§b[${n}]`, req: 750 },
	{ fmt: (n) => `§c[${n}]`, req: 1000 },
	{ fmt: (n) => `§6[${n}]`, req: 1500 },
	{ fmt: (n) => `§3[${n}]`, req: 2000 },
	{ fmt: (n) => `§a[${n}]`, req: 2500 },
	{ fmt: (n) => `§2[${n}]`, req: 3000 },
	{ fmt: (n) => `§9[${n}]`, req: 5000 },
	{ fmt: (n) => `§1[${n}]`, req: 7500 },
	{ fmt: (n) => `§1§l[${n}]`, req: 10_000 },
	{ fmt: (n) => `§4[${n}]`, req: 20_000 },
	{ fmt: (n) => `§4§l[${n}]`, req: 30_000 },
	{ fmt: (n) => `§5§l[${n}]`, req: 40_000 },
	{ fmt: (n) => `§0§l[${n}]`, req: 50_000 },
	{ fmt: (n) => rainbow(`[${n}]`), req: 100_000 },
];
