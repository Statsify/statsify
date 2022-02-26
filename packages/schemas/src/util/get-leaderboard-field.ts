import { getConstructor, mockClass } from '@statsify/util';
import { FieldMetadata, LeaderboardOptions, LeaderboardSort } from '../decorators';
import { getPropertyNames } from './shared';

export const getLeaderboardField = <T>(instance: T, field: string): LeaderboardOptions => {
  let extraDisplay: string | undefined;
  const additionalFields: string[] = [];
  let name = '';
  let aliases: string[] = [];
  let sort: LeaderboardSort = 'DESC';

  const parts = field.split('.');

  const traverse = <T>(instance: T) => {
    const constructor = getConstructor(instance);
    const propertyKeys = getPropertyNames(instance);

    for (const propertyKey of propertyKeys) {
      const metadata: FieldMetadata = Reflect.getMetadata(
        'statsify:field',
        constructor.prototype,
        propertyKey as string
      );

      if (!metadata) continue;

      if (propertyKey === parts[0]) {
        const { leaderboardOptions } = metadata;

        sort = leaderboardOptions.sort;
        name = leaderboardOptions.name;
        aliases = leaderboardOptions.aliases;
        extraDisplay = leaderboardOptions.extraDisplay
          ? leaderboardOptions.extraDisplay
          : extraDisplay;
        additionalFields.push(...leaderboardOptions.additionalFields);

        parts.shift();

        if (parts.length === 0) {
          const groups = [
            ['wins', 'losses', 'wlr'],
            ['kills', 'deaths', 'kdr'],
            ['finalKills', 'finalDeaths', 'fkdr'],
            ['bedsBroken', 'bedsLost', 'bblr'],
          ];

          const group = groups.find((group) => group.includes(propertyKey));

          if (group) {
            const currentKey = field.split('.').slice(0, -1).join('.');

            const remaining = group
              .filter((key) => key !== propertyKey && key in instance)
              .map((key) => `${currentKey}.${key}`);

            additionalFields.push(...remaining);
          }

          break;
        }

        traverse(mockClass(metadata.type));
        break;
      }
    }
  };

  traverse(instance);

  return {
    sort,
    aliases,
    name,
    additionalFields,
    extraDisplay,
  };
};
