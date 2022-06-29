/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container, { Service } from "typedi";
import { Ticket } from "@statsify/schemas";
import { createConnection } from "mongoose";
import { env } from "@statsify/util";
import { getModelForClass } from "@typegoose/typegoose";

@Service()
export class MongoLoaderService {
  public init() {
    const connection = createConnection(env("MONGODB_URI"));

    const models = [Ticket];

    models.forEach((modelClass) => {
      const model = getModelForClass(modelClass, { existingConnection: connection });
      Container.set(modelClass, model);
    });
  }
}
