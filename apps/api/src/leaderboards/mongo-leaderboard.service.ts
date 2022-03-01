import { Constructor, noop } from '@statsify/util';
import { getModelForClass } from '@typegoose/typegoose';

export class MongoLeaderboardService {
  public async getLeaderboard<T>(
    constructor: Constructor<T>,
    field: string,
    selector: Record<string, boolean>,
    filter: Record<string, any>
  ): Promise<{ data: Record<string, any>; index: number }[]>;
  public async getLeaderboard<T>(
    constructor: Constructor<T>,
    field: string,
    selector: Record<string, boolean>,
    top: number,
    bottom: number
  ): Promise<{ data: Record<string, any>; index: number }[]>;
  public async getLeaderboard<T>(
    constructor: Constructor<T>,
    field: string,
    selector: Record<string, boolean>,
    topOrFilter: number | Record<string, any>,
    bottom?: number
  ): Promise<{ data: Record<string, any>; index: number }[]> {
    const model = getModelForClass(constructor);

    //TODO(jacobk999): Add support for filtering and creating leaderboard based on custom position
    if (typeof topOrFilter === 'object') {
      return noop();
    }

    const top = topOrFilter;

    const response = await model
      .find()
      .select(selector)
      .sort({ [field]: -1 })
      .skip(top)
      .limit((bottom as number) - top)
      .lean()
      .exec();

    return response.map((data, index) => ({ data, index: top + index }));
  }

  public async getLeaderboardRanking<T>(
    constructor: Constructor<T>,
    field: string,
    value: number
  ): Promise<number | null> {
    const model = getModelForClass(constructor);

    return model.countDocuments().where(field).gte(value).lean().exec();
  }
}
