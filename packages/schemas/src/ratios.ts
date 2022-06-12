type Ratio = [
  numerator: string,
  denominator: string,
  name: string,
  prettyName: string,
  multiplier?: number
];

const LEADERBOARD_RATIOS: Ratio[] = [
  ['wins', 'losses', 'wlr', 'WLR'],
  ['kills', 'deaths', 'kdr', 'KDR'],
  ['finalKills', 'finalDeaths', 'fkdr', 'FKDR'],
  ['bedsBroken', 'bedsLost', 'bblr', 'BBLR'],
];

export const LEADERBOARD_RATIO_KEYS = LEADERBOARD_RATIOS.map((r) => [r[0], r[1], r[2]] as const);

const EXTRA_RATIOS: Ratio[] = [
  ['kills', 'shotFired', 'shotAccuracy', 'Shot Accuracy', 100],
  ['wins', 'gamesPlayed', 'winRate', 'Win Rate', 100],
  ['gold', 'gamesPlayed', 'goldRate', 'Gold Rate', 100],
  ['total', 'gamesPlayed', 'trophyRate', 'Trophy Rate', 100],
];

export const RATIO_STATS: Ratio[] = [...LEADERBOARD_RATIOS, ...EXTRA_RATIOS];
export const RATIOS = RATIO_STATS.map((r) => r[2]);
