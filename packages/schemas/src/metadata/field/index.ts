import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { prop } from '@typegoose/typegoose';
import { METADATA_KEY } from '../constants';
import { FieldOptions } from '../field.options';
import { ClassMetadata } from '../metadata.interface';
import { getLeaderboardMetadata } from './get-leaderboard-metadata';
import { getStoreMetadata } from './get-store-metadata';
import { getTypeMetadata } from './get-type-metadata';

export function Field({
  type: typeOptions,
  leaderboard: leaderboardOptions,
  store: storeOptions,
  docs: docsOptions,
  mongo: mongoOptions,
}: FieldOptions = {}): PropertyDecorator {
  return (target, propertyKey) => {
    const metadata = (Reflect.getMetadata(METADATA_KEY, target) ?? {}) as ClassMetadata;

    const type = getTypeMetadata(typeOptions, target, propertyKey);
    const leaderboard = getLeaderboardMetadata(type, propertyKey as string, leaderboardOptions);
    const store = getStoreMetadata(type, leaderboard, storeOptions);

    Reflect.defineMetadata(
      METADATA_KEY,
      {
        ...metadata,
        [propertyKey as string]: {
          type,
          leaderboard,
          store,
        },
      },
      target
    );

    //Swagger api doc options
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

    //Typegoose options
    prop({
      type: type.type,
      required: store.required,
      ...mongoOptions,
    })(target, propertyKey);
  };
}
