/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Inject, Service } from "typedi";
import { User, UserTier } from "@statsify/schemas";
import type { ReturnModelType } from "@typegoose/typegoose";

@Service()
export class UserService {
  public constructor(
    @Inject(() => User) private readonly userModel: ReturnModelType<typeof User>
  ) {}

  public async findAllPremium() {
    const users = await this.userModel
      .find({ tier: { $gte: UserTier.IRON, $lte: UserTier.NETHERITE } })
      .select({ id: true, tier: true, serverBooster: true, patreon: true })
      .lean()
      .exec();

    return users as {
      id: string;
      tier: UserTier;
      serverBooster?: boolean;
      patreon?: boolean;
    }[];
  }

  public async addPremium(id: string, tier: UserTier) {
    await this.userModel.updateOne({ id }, { tier }, { upsert: true }).lean().exec();
  }

  public async removePremium(id: string) {
    await this.userModel
      .updateOne({ id }, { $unset: { tier: "" } }, { upsert: true })
      .lean()
      .exec();
  }

  public async removeAllPremium(id: string) {
    await this.userModel
      .updateOne(
        { id },
        { $unset: { tier: "", patreon: "", serverBooster: "" } },
        { upsert: true }
      )
      .lean()
      .exec();
  }

  public async addPatreon(id: string) {
    await this.userModel
      .updateOne({ id }, { $set: { patreon: true } }, { upsert: true })
      .lean()
      .exec();
  }

  public async removePatreon(id: string) {
    return this.userModel
      .findOneAndUpdate({ id }, { $unset: { patreon: "" } }, { upsert: true })
      .lean()
      .exec();
  }

  public addServerBooster(id: string) {
    return this.userModel
      .findOneAndUpdate({ id }, { serverBooster: true }, { upsert: true })
      .lean()
      .exec();
  }

  public removeServerBooster(id: string) {
    return this.userModel
      .findOneAndUpdate({ id }, { $unset: { serverBooster: "" } }, { upsert: true })
      .lean()
      .exec();
  }

  public getTier(id: string) {
    return this.userModel.findOne({ id }).select({ tier: true }).lean().exec();
  }
}
