/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";
import { s } from "#definition/s";

export const SkinSchema = s.model("Skin", {
  uuid: s.string().index({ unique: true }),
  username: s.string(),
  skinUrl: s.string(),
  slim: s.boolean().optional(),
  capeUrl: s.string().optional(),
  expiresAt: s.number().setLater(),
});

export type Skin = s.infer<typeof SkinSchema>;

export function skin(data: APIData): s.input<typeof SkinSchema> {
  const property = data.properties.find((prop: any) => prop.name === "textures");
  const { textures } = JSON.parse(Buffer.from(property.value, "base64").toString());

  return {
    uuid: data.id,
    username: data.name,
    skinUrl: textures.SKIN.url,
    slim: textures.SKIN.metadata?.model === "slim",
    capeUrl: textures.CAPE?.url,
  };
}
