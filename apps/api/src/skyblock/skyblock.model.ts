/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { modelOptions as ModelOptions, prop } from "@typegoose/typegoose";

// There's no TTL index, since the latest copy is the stale fallback.
@ModelOptions({ schemaOptions: { collection: "skyblock", versionKey: false } })
export class SkyBlockProfiles {
  @prop({ required: true, unique: true })
  public uuid: string;

  @prop({ required: true })
  public fetchedAt: number;

  // The gzipped profiles are null for a player who never played SkyBlock.
  @prop({ required: true })
  public data: Buffer;
}

@ModelOptions({
  schemaOptions: { collection: "skyblockmuseum", versionKey: false },
})
export class SkyBlockMuseum {
  @prop({ required: true, unique: true })
  public profileId: string;

  @prop({ required: true })
  public fetchedAt: number;

  @prop({ required: true })
  public data: Buffer;
}
