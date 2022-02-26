import { getConstructor, mockClass } from '@statsify/util';
import { FieldMetadata } from '../decorators';
import { getPropertyNames } from './shared';

const primitiveTypes = [String, Number, Boolean, Symbol, BigInt, undefined];

export const getLeaderboardFields = <T>(instance: T) => {
  const constructor = getConstructor(instance);
  const propertyKeys = getPropertyNames(instance) as string[];
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
      const fields = getLeaderboardFields(mockClass(metadata.type));
      leaderboardFields.push(...fields.map((field) => `${propertyKey}.${field}`));
    }
  }

  return leaderboardFields;
};
