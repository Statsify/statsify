/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { BasePropOptions } from "@typegoose/typegoose/lib/types.js";
import type { Constructor } from "@statsify/util";
import type { HistoricalEnabledMetadata, LeaderboardEnabledMetadata, StoreMetadata } from "./metadata.interface.js";

export type TypeOptions = () => Constructor | [Constructor];
export type LeaderboardOptions = Omit<BasePropOptions | Partial<LeaderboardEnabledMetadata>, "default">;

export type HistoricalOptions = Omit<BasePropOptions | Partial<HistoricalEnabledMetadata>, "default">;

export type StoreOptions = Partial<StoreMetadata>;

export type DocOptions = Partial<{
	hide: boolean;
	examples: string[];
	enum: any[];
	enumName: string;
	description: string;
	deprecated: boolean;
	min: number;
	max: number;
}>;

export interface FieldOptions {
	type?: TypeOptions;
	leaderboard?: LeaderboardOptions;
	historical?: HistoricalOptions;
	store?: StoreOptions;
	docs?: DocOptions;
	mongo?: Partial<BasePropOptions>;
}
