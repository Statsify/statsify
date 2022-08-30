/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { Friend } from "./friend.js";
import type { APIData } from "@statsify/util";

export class Friends {
  @Field({ type: () => [Friend] })
  public friends: Friend[];

  @Field({ mongo: { index: true, unique: true } })
  public uuid: string;

  @Field()
  public displayName: string;

  @Field({ leaderboard: { enabled: false } })
  public expiresAt: number;

  @Field({ store: { store: false } })
  public cached?: boolean;

  public constructor(data: APIData = {}) {
    const records = Object.entries(data);
    this.friends = records.map(([uuid, friend]) => new Friend(uuid, friend));
  }
}

export * from "./friend.js";
