/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container, { Service } from "typedi";
import { Tag, Ticket, User } from "@statsify/schemas";
import { config } from "@statsify/util";
import { createConnection } from "mongoose";
import { getModelForClass } from "@typegoose/typegoose";

@Service()
export class MongoLoaderService {
  public init() {
    const connection = createConnection(config("database.mongoUri"));

    const models = [Ticket, Tag, User];

    models.forEach((modelClass) => {
      const model = getModelForClass(modelClass, { existingConnection: connection });
      Container.set(modelClass, model);
    });
  }
}
