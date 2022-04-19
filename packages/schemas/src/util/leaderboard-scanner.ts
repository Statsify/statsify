import { Constructor, FlattenKeys } from '@statsify/util';
import { MetadataScanner } from '../metadata';
import { LeaderboardEnabledMetadata } from '../metadata/metadata.interface';

export class LeaderboardScanner {
  private static tokens: Map<Constructor, string[]> = new Map();

  public static getLeaderboardFields<T>(constructor: Constructor<T>): FlattenKeys<T>[] {
    if (this.tokens.has(constructor))
      return LeaderboardScanner.tokens.get(constructor) as FlattenKeys<T>[];

    const metadata = MetadataScanner.scan(constructor);

    const fields = metadata
      .filter(([, { leaderboard }]) => leaderboard.enabled)
      .map(([key]) => key);

    this.tokens.set(constructor, fields);

    return fields as FlattenKeys<T>[];
  }

  public static getLeaderboardField<T>(
    constructor: Constructor<T>,
    key: string
  ): LeaderboardEnabledMetadata {
    const metadata = MetadataScanner.scan(constructor);

    const field = metadata.find(([k]) => k === key);

    if (!field) throw new Error(`${key} is not a field for ${constructor.name}`);

    const [, { leaderboard }] = field;

    if (!leaderboard.enabled)
      throw new Error(`${key} is not a leaderboard field for ${constructor.name}`);

    return leaderboard;
  }
}
