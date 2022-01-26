import { Constructor } from '@statsify/util';
import { FieldMetadata } from '../decorators';
import { getPropertyNames } from './shared';

const primitiveTypes = [String, Number, Boolean, Symbol, BigInt, undefined];

export const getLeaderboardFields = (constructor: Constructor) => {
  const propertyKeys = getPropertyNames(constructor) as string[];
  const leaderboardFields: string[] = [];

  for (const propertyKey of propertyKeys) {
    const metadata: FieldMetadata = Reflect.getMetadata(
      'statsify:field',
      constructor.prototype,
      propertyKey as string
    );

    if (!metadata) continue;

    if (metadata.isLeaderboard) {
      leaderboardFields.push(propertyKey);
    } else if (primitiveTypes.includes(metadata.type)) {
      continue;
    } else {
      const fields = getLeaderboardFields(metadata.type);
      leaderboardFields.push(...fields.map((field) => `${propertyKey}.${field}`));
    }
  }

  return leaderboardFields;
};
