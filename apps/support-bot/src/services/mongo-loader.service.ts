/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Service } from "typedi";
import { TagSchema, TicketSchema, UserSchema } from "@statsify/schemas";
import { config } from "@statsify/util";
import { createConnection } from "mongoose";
import { toMongoose } from "@statsify/schemas/mongoose";

@Service()
export class MongoLoaderService {
  public async init() {
    const connection = await createConnection(await config("database.mongoUri")).asPromise();

    const models = [TicketSchema, TagSchema, UserSchema];

    // Services inject each model by its name
    for (const schema of models) {
      Container.set(schema.name, connection.model(schema.name, toMongoose(schema)));
    }
  }
}
