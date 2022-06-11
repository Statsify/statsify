import { prettify } from '@statsify/util';
import { LeaderboardOptions } from '../field.options';
import { LeaderboardMetadata, TypeMetadata } from '../metadata.interface';

const getLeaderboardName = (field: string) => {
  if (['wlr', 'kdr', 'fkdr', 'bblr'].includes(field)) return field.toUpperCase();
  return prettify(field);
};

export const getLeaderboardMetadata = (
  typeMetadata: TypeMetadata,
  propertyKey: string,
  leaderboardOptions?: LeaderboardOptions
): LeaderboardMetadata => {
  const name = leaderboardOptions?.fieldName ?? getLeaderboardName(propertyKey);

  if (typeMetadata.type !== Number || leaderboardOptions?.enabled === false) {
    return {
      enabled: false,
      additionalFields: leaderboardOptions?.additionalFields || [],
      extraDisplay: leaderboardOptions?.extraDisplay,
      formatter: leaderboardOptions?.formatter,
      fieldName: name,
      name,
    };
  }

  return {
    enabled: true,
    sort: leaderboardOptions?.sort || 'DESC',
    fieldName: name,
    name,
    aliases: leaderboardOptions?.aliases || [],
    additionalFields: leaderboardOptions?.additionalFields || [],
    extraDisplay: leaderboardOptions?.extraDisplay,
    formatter: leaderboardOptions?.formatter,
  };
};
