import { Constructor } from '@statsify/util';
import { MetadataScanner } from '../metadata';
import { LeaderboardEnabledMetadata } from '../metadata/metadata.interface';

export class LeaderboardScanner {
  public static getLeaderboardMetadata<T>(constructor: Constructor<T>) {
    const metadata = MetadataScanner.scan(constructor);

    const fields = metadata.filter(([, { leaderboard }]) => leaderboard.enabled);

    return fields;
  }

  public static getLeaderboardFields<T>(constructor: Constructor<T>): string[] {
    return this.getLeaderboardMetadata(constructor).map(([key]) => key);
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
