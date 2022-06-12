import { prettify } from '@statsify/util';
import { RATIOS, RATIO_STATS } from '../../ratios';
import { LeaderboardOptions } from '../field.options';
import { LeaderboardMetadata, TypeMetadata } from '../metadata.interface';

const getLeaderboardName = (field: string) => {
  const ratioIndex = RATIOS.indexOf(field);
  if (ratioIndex > -1) return RATIO_STATS[ratioIndex][3];
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
    hidden: leaderboardOptions?.hidden,
    aliases: leaderboardOptions?.aliases || [],
    additionalFields: leaderboardOptions?.additionalFields || [],
    extraDisplay: leaderboardOptions?.extraDisplay,
    formatter: leaderboardOptions?.formatter,
  };
};
