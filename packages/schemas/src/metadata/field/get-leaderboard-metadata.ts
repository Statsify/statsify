import { prettify } from '@statsify/util';
import { LeaderboardOptions } from '../field.options';
import { LeaderboardMetadata, TypeMetadata } from '../metadata.interface';

const getLeaderboardName = (field: string) => {
  if (['wlr', 'kdr', 'fkdr', 'bblr'].includes(field)) return field.toUpperCase();
  return prettify(field);
};

//It is safe to assume that value is a number because this will only be used for leaderboard fields
export const defaultFormatter = <T>(value: T) => (value as unknown as number).toLocaleString();

export const getLeaderboardMetadata = (
  typeMetadata: TypeMetadata,
  propertyKey: string,
  leaderboardOptions?: LeaderboardOptions
): LeaderboardMetadata => {
  if (typeMetadata.type !== Number || leaderboardOptions?.enabled === false) {
    return {
      enabled: false,
      additionalFields: leaderboardOptions?.additionalFields || [],
      extraDisplay: leaderboardOptions?.extraDisplay,
      formatter: leaderboardOptions?.formatter,
    };
  }

  return {
    enabled: true,
    sort: leaderboardOptions?.sort || 'DESC',
    name: leaderboardOptions?.name ?? getLeaderboardName(propertyKey),
    aliases: leaderboardOptions?.aliases || [],
    additionalFields: leaderboardOptions?.additionalFields || [],
    extraDisplay: leaderboardOptions?.extraDisplay,
    formatter: leaderboardOptions?.formatter ?? defaultFormatter,
  };
};
