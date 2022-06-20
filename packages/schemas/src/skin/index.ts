/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Field } from '../metadata';

export class Skin {
  @Field({ mongo: { index: true, unique: true } })
  public uuid: string;

  @Field()
  public username: string;

  @Field()
  public skinUrl: string;

  @Field({ store: { required: false } })
  public slim?: boolean;

  @Field()
  public expiresAt: number;

  public constructor(data: APIData) {
    this.uuid = data.id;
    this.username = data.name;

    const property = data.properties.find((prop: any) => prop.name === 'textures');
    const { textures } = JSON.parse(Buffer.from(property.value, 'base64').toString());

    this.skinUrl = textures.SKIN.url;
    this.slim = textures.SKIN.metadata?.model === 'slim';
  }
}
