/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { METADATA_KEY } from "../constants.js";
import { getLeaderboardMetadata } from "./get-leaderboard-metadata.js";
import { getStoreMetadata } from "./get-store-metadata.js";
import { getTypeMetadata } from "./get-type-metadata.js";
import { prop } from "@typegoose/typegoose";
import type { ClassMetadata } from "../metadata.interface.js";
import type { FieldOptions } from "../field.options.js";

export function Field({
  type: typeOptions,
  leaderboard: leaderboardOptions,
  historical: historicalOptions,
  store: storeOptions,
  docs: docsOptions,
  mongo: mongoOptions,
}: FieldOptions = {}): PropertyDecorator {
  return (target, propertyKey) => {
    const metadata = (Reflect.getMetadata(METADATA_KEY, target) ?? {}) as ClassMetadata;

    const type = getTypeMetadata(typeOptions, target, propertyKey);

    const { leaderboard, historical } = getLeaderboardMetadata(
      type,
      propertyKey as string,
      leaderboardOptions,
      historicalOptions
    );

    const store = getStoreMetadata(type, leaderboard, storeOptions);

    Reflect.defineMetadata(
      METADATA_KEY,
      {
        ...metadata,
        [propertyKey as string]: {
          type,
          leaderboard,
          historical,
          store,
        },
      },
      target
    );

    // Swagger api doc options
    const apiProperty = docsOptions?.hide
      ? ApiHideProperty()
      : ApiProperty({
        type: type.type,
        isArray: type.array,
        default: store.default,
        description: docsOptions?.description,
        required: store.required,
        examples: docsOptions?.examples,
        enum: docsOptions?.enum,
        enumName: docsOptions?.enumName,
        deprecated: docsOptions?.deprecated,
        minimum: docsOptions?.min,
        maximum: docsOptions?.max,
      });

    apiProperty(target, propertyKey);

    if (!store.store) return;

    // Typegoose options
    prop({
      type: type.type,
      required: store.required,
      ...mongoOptions,
    })(target, propertyKey);
  };
}
