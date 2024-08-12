/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import mongoose from "mongoose";
import { Guild, Player, Session, Skin, User } from "@statsify/schemas";
import { Logger } from "@statsify/logger";
import { config } from "@statsify/util";
import { getModelForClass } from "@typegoose/typegoose";

try {
  await mongoose.connect(config("database.mongoUri"));
} catch (error) {
  const logger = new Logger("database");
  logger.fatal("Failed to connect to MongoDB", error);
  process.exit(1);
}

export const Players = getModelForClass(Player);
export const Guilds = getModelForClass(Guild);
export const Users = getModelForClass(User);
export const Skins = getModelForClass(Skin);
export const Sessions = getModelForClass(Session);
