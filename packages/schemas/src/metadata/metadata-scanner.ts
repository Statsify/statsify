/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ClassMetadata, FieldMetadata } from "./metadata.interface";
import { Constructor } from "@statsify/util";
import { LEADERBOARD_RATIO_KEYS } from "../ratios";
import { METADATA_KEY } from "./constants";

export type MetadataEntry = [string, FieldMetadata];

export class MetadataScanner {
  private static tokens: Map<Constructor, MetadataEntry[]> = new Map();

  public static scan(target: Constructor) {
    if (this.tokens.has(target)) return this.tokens.get(target)!;

    const metadata = this.getMetadataEntries(target);

    this.tokens.set(target, metadata);

    return metadata;
  }

  private static getMetadataEntries(
    constructor: Constructor,
    base = "",
    baseName = ""
  ): MetadataEntry[] {
    const classMetadata = Reflect.getMetadata(
      METADATA_KEY,
      constructor.prototype
    ) as ClassMetadata;

    if (!classMetadata) return [];

    const entries = Object.entries(classMetadata);
    const keys = Object.keys(classMetadata);

    const metadataEntries: MetadataEntry[] = [];

    entries.forEach(([key, value]) => {
      const path = `${base ? `${base}.` : ""}${key}`;
      const name = value.leaderboard.name
        ? `${baseName ? `${baseName} ` : ""}${value.leaderboard.name}`
        : baseName;

      for (const ratio of LEADERBOARD_RATIO_KEYS) {
        if (!ratio.includes(key)) continue;

        const remainingStats = ratio
          .filter((r) => r !== key && keys.includes(r))
          .map((r) => `${base ? `${base}.` : ""}${r}`);

        if (!remainingStats.length) continue;

        value.leaderboard.additionalFields = remainingStats;
        break;
      }

      if (value.type.primitive || value.type.array)
        return metadataEntries.push([
          path,
          { ...value, leaderboard: { ...value.leaderboard, name } },
        ]);

      //Carry the metadata down to the children
      const subMetadataEntries = this.getMetadataEntries(value.type.type, path, name).map(
        ([keyPath, metadata]) => {
          if (!metadata.leaderboard.additionalFields?.length)
            metadata.leaderboard.additionalFields = value.leaderboard.additionalFields;

          if (!metadata.leaderboard.extraDisplay)
            metadata.leaderboard.extraDisplay = value.leaderboard.extraDisplay;

          if (value.leaderboard.resetEvery && !metadata.leaderboard.resetEvery)
            metadata.leaderboard.resetEvery = value.leaderboard.resetEvery;

          return [keyPath, metadata] as MetadataEntry;
        }
      );

      metadataEntries.push(...subMetadataEntries);
    });

    return metadataEntries;
  }
}
