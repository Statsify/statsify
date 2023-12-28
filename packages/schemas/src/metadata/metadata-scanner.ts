/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEADERBOARD_RATIO_KEYS } from "#ratios";
import { METADATA_KEY } from "./constants.js";
import type { ClassMetadata, FieldMetadata, LeaderboardEnabledMetadata } from "./metadata.interface.js";
import type { Constructor } from "@statsify/util";

export type MetadataEntry = [string, FieldMetadata];

export class MetadataScanner {
	private static tokens: Map<Constructor, MetadataEntry[]> = new Map();

	public static scan(target: Constructor) {
		if (this.tokens.has(target)) return this.tokens.get(target)!;

		const metadata = this.getMetadataEntries(target);

		this.tokens.set(target, metadata);

		return metadata;
	}

	private static getMetadataEntries(constructor: Constructor, base = "", baseName = ""): MetadataEntry[] {
		const classMetadata = Reflect.getMetadata(METADATA_KEY, constructor.prototype) as ClassMetadata;

		if (!classMetadata) return [];

		const entries = Object.entries(classMetadata);
		const keys = Object.keys(classMetadata);

		const metadataEntries: MetadataEntry[] = [];

		entries.forEach(([key, value]) => {
			const path = `${base ? `${base}.` : ""}${key}`;
			const name = value.leaderboard.name ? `${baseName ? `${baseName} ` : ""}${value.leaderboard.name}` : baseName;

			const historicalName = value.historical.name ? `${baseName ? `${baseName} ` : ""}${value.historical.name}` : baseName;

			for (const ratio of LEADERBOARD_RATIO_KEYS) {
				if (!ratio.includes(key)) continue;

				const remainingStats = ratio.filter((r) => r !== key && keys.includes(r)).map((r) => `${base ? `${base}.` : ""}${r}`);

				if (!remainingStats.length) continue;

				value.leaderboard.additionalFields = remainingStats;
				//TODO: Investigate if this is needed or if there is another way
				//TODO: Does this break anything?
				//! This is needed for the ratios to work with sub modes
				value.historical.additionalFields = remainingStats;
				break;
			}

			// Apply metadata to historical
			if (!value.historical.additionalFields || value.historical.additionalFields.length === 0)
				value.historical.additionalFields = value.leaderboard.additionalFields;

			if (value.type.primitive || value.type.array)
				return metadataEntries.push([
					path,
					{
						...value,
						leaderboard: { ...value.leaderboard, name },
						historical: { ...value.historical, name: historicalName },
					},
				]);

			//Carry the metadata down to the children
			const subMetadataEntries = this.getMetadataEntries(value.type.type, path, name).map(([keyPath, metadata]) => {
				if (!metadata.leaderboard.additionalFields?.length) metadata.leaderboard.additionalFields = value.leaderboard.additionalFields;

				if (!metadata.leaderboard.extraDisplay) metadata.leaderboard.extraDisplay = value.leaderboard.extraDisplay;

				if (value.leaderboard.resetEvery && !metadata.leaderboard.resetEvery) metadata.leaderboard.resetEvery = value.leaderboard.resetEvery;

				if (!metadata.historical.additionalFields?.length) metadata.historical.additionalFields = value.historical.additionalFields;

				return [keyPath, metadata] as MetadataEntry;
			});

			metadataEntries.push(...subMetadataEntries);
		});

		return metadataEntries;
	}
}

if (import.meta.vitest) {
	const { test, it, expect } = import.meta.vitest;

	const { Field } = await import("./field/index.js");
	const { prettify } = await import("@statsify/util");

	const stringMetadata = (name: string): FieldMetadata => {
		const fieldName = prettify(name.slice(Math.max(0, name.lastIndexOf(".") > -1 ? name.lastIndexOf(".") + 1 : 0)));

		return {
			leaderboard: {
				enabled: false,
				additionalFields: [],
				extraDisplay: undefined,
				formatter: undefined,
				resetEvery: undefined,
				name: name.split(".").map(prettify).join(" "),
				fieldName,
			},
			type: { type: String, array: false, primitive: true },
			store: {
				required: true,
				serialize: true,
				deserialize: true,
				store: true,
				default: "",
			},
			historical: {
				enabled: false,
				additionalFields: [],
				formatter: undefined,
				name: name.split(".").map(prettify).join(" "),
				fieldName,
			},
		};
	};

	test("MetadataScanner", () => {
		it("should read and write basic string metadata", () => {
			class Clazz {
				@Field()
				public fieldA: string;
			}

			expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([["fieldA", stringMetadata("fieldA")]]);
		});

		it("should read and write basic number metadata", () => {
			class Clazz {
				@Field()
				public fieldA: number;
			}

			expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
				[
					"fieldA",
					{
						leaderboard: {
							enabled: true,
							name: prettify("fieldA"),
							fieldName: prettify("fieldA"),
							additionalFields: [],
							aliases: [],
							sort: "DESC",
							limit: 50_000,
						},
						type: { type: Number, array: false, primitive: true },
						store: {
							required: true,
							serialize: true,
							deserialize: true,
							store: true,
							default: 0,
						},
						historical: {
							enabled: true,
							name: prettify("fieldA"),
							aliases: [],
							limit: 50_000,
							sort: "DESC",
							fieldName: prettify("fieldA"),
							additionalFields: [],
						},
					},
				],
			]);
		});

		it("should read and write leaderboard false metadata", () => {
			class Clazz {
				@Field({ leaderboard: { enabled: false } })
				public fieldA: number;
			}

			expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
				[
					"fieldA",
					{
						leaderboard: {
							enabled: false,
							additionalFields: [],
							name: prettify("fieldA"),
							fieldName: prettify("fieldA"),
						},
						type: { type: Number, array: false, primitive: true },
						store: {
							required: true,
							serialize: true,
							deserialize: true,
							store: true,
							default: 0,
						},
						historical: {
							additionalFields: [],
							enabled: false,
							fieldName: prettify("fieldA"),
							formatter: undefined,
							name: prettify("fieldA"),
						},
					},
				],
			]);
		});

		it("should read and write array metadata", () => {
			class Clazz {
				@Field({ type: () => [String] })
				public fieldA: string[];
			}

			expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
				[
					"fieldA",
					{
						...stringMetadata("fieldA"),
						type: { type: String, array: true, primitive: true },
					},
				],
			]);
		});

		it("should read and write nested metadata", () => {
			class SuperNestedClazz {
				@Field()
				public fieldA: string;
			}

			class NestedClazz {
				@Field()
				public fieldA: string;

				@Field()
				public fieldB: SuperNestedClazz;
			}

			class Clazz {
				@Field()
				public fieldA: string;

				@Field()
				public fieldB: NestedClazz;
			}

			expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
				["fieldA", stringMetadata("fieldA")],
				["fieldB.fieldA", stringMetadata("fieldB.fieldA")],
				["fieldB.fieldB.fieldA", stringMetadata("fieldB.fieldB.fieldA")],
			]);
		});

		it("should read and write with inherited metadata", () => {
			class ParentClazz {
				@Field()
				public fieldA: string;
			}

			class ChildClazz extends ParentClazz {
				@Field()
				public fieldB: string;
			}

			expect(MetadataScanner.scan(ChildClazz)).toEqual<MetadataEntry[]>([
				["fieldA", stringMetadata("fieldA")],
				["fieldB", stringMetadata("fieldB")],
			]);
		});

		it("should carry down metadata", () => {
			class ChildClazz {
				@Field()
				public fieldB: number;
			}

			class ParentClazz {
				@Field({ leaderboard: { additionalFields: ["fieldA"], extraDisplay: "fieldA" } })
				public fieldA: ChildClazz;
			}

			const [[, { leaderboard }]] = MetadataScanner.scan(ParentClazz);

			expect(leaderboard).toEqual<LeaderboardEnabledMetadata>({
				enabled: true,
				name: "Field A Field B",
				fieldName: prettify("fieldB"),
				formatter: undefined,
				hidden: undefined,
				additionalFields: ["fieldA"],
				extraDisplay: "fieldA",
				aliases: [],
				sort: "DESC",
				limit: 50_000,
				resetEvery: undefined,
			});
		});
	});
}
