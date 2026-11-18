/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { modelOptions as ModelOptions, prop } from "@typegoose/typegoose";

// No TTL index: each document is the latest copy, kept as the stale fallback.
@ModelOptions({ schemaOptions: { collection: "skyblock", versionKey: false } })
export class SkyBlockProfiles {
  @prop({ required: true, unique: true })
  public uuid: string;

  @prop({ required: true })
  public fetchedAt: number;

  // gzip(JSON.stringify(res.profiles)), which is "null" for a player who never played
  @prop({ required: true })
  public data: Buffer;
}

@ModelOptions({ schemaOptions: { collection: "skyblockmuseum", versionKey: false } })
export class SkyBlockMuseum {
  @prop({ required: true, unique: true })
  public profileId: string;

  @prop({ required: true })
  public fetchedAt: number;

  // gzip(JSON.stringify(res.members))
  @prop({ required: true })
  public data: Buffer;
}
