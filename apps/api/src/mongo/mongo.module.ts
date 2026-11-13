/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ConnectOptions, type Connection, type Model, createConnection } from "mongoose";
import { type DynamicModule, Global, Inject, Module, type Provider } from "@nestjs/common";
import type { ModelSchema, s } from "@statsify/schemas";
import { toMongoose } from "@statsify/schemas/mongoose";

const CONNECTION_TOKEN = "MongoConnection";

/** A model saved under another name and collection, like sessions, which are saved players */
interface NamedModel {
  name: string;
  schema: ModelSchema;
  collection: string;
}

export type MongoModel<S extends ModelSchema> = Model<s.infer<S>>;

const getModelToken = (name: string) => `${name}Model`;

export const InjectModel = (model: ModelSchema | string) =>
  Inject(getModelToken(typeof model === "string" ? model : model.name));

@Global()
@Module({})
export class MongoCoreModule {
  public static forRoot(uri: string, options: ConnectOptions): DynamicModule {
    const connection: Provider = {
      provide: CONNECTION_TOKEN,
      useFactory: () => createConnection(uri, options).asPromise(),
    };

    return { module: MongoCoreModule, providers: [connection], exports: [connection] };
  }
}

@Module({})
export class MongoModule {
  public static forRoot(uri: string, options: ConnectOptions): DynamicModule {
    return {
      module: MongoModule,
      imports: [MongoCoreModule.forRoot(uri, options)],
      exports: [MongoCoreModule],
    };
  }

  /** Mongoose names a collection after its model, plural and lowercase (Player is players), as Typegoose did */
  public static forFeature(models: (ModelSchema | NamedModel)[]): DynamicModule {
    const providers = models.map((model): Provider => {
      const { name, schema, collection } =
        "schema" in model ? model : { name: model.name, schema: model, collection: undefined };

      return {
        provide: getModelToken(name),
        // Several modules ask for the same model, and Mongoose compiles each name once
        useFactory: (connection: Connection) =>
          connection.models[name] ?? connection.model(name, toMongoose(schema), collection),
        inject: [CONNECTION_TOKEN],
      };
    });

    return { module: MongoModule, providers, exports: providers };
  }
}
