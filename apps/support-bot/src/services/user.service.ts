/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Inject, Service } from "typedi";
import { ReturnModelType } from "@typegoose/typegoose";
import { User, UserTier } from "@statsify/schemas";

@Service()
export class UserService {
  public constructor(
    @Inject(() => User) private readonly userModel: ReturnModelType<typeof User>
  ) {}

  public async findAllPremium(): Promise<string[]> {
    const users = await this.userModel
      .find()
      .where("tier")
      .equals(UserTier.PREMIUM)
      .select({ id: true })
      .lean()
      .exec();

    return users.map((u) => u.id);
  }

  public async addPremiumUser(id: string) {
    await this.userModel
      .updateOne({ id }, { tier: UserTier.PREMIUM }, { upsert: true })
      .lean()
      .exec();
  }

  public async removePremiumUser(id: string) {
    await this.userModel
      .updateOne(
        { id, tier: UserTier.PREMIUM },
        { $unset: { tier: "" } },
        { upsert: true }
      )
      .lean()
      .exec();
  }

  public async findAllNitroBoosters(): Promise<string[]> {
    const users = await this.userModel
      .find()
      .where("nitroBooster")
      .equals(true)
      .select({ id: true })
      .lean()
      .exec();

    return users.map((u) => u.id);
  }

  public async addNitroBoosterUser(id: string) {
    await this.userModel
      .updateOne({ id }, { nitroBooster: true }, { upsert: true })
      .lean()
      .exec();
  }

  public async removeNitroBoosterUser(id: string) {
    await this.userModel
      .updateOne({ id }, { $unset: { nitroBooster: "" } }, { upsert: true })
      .lean()
      .exec();
  }
}
