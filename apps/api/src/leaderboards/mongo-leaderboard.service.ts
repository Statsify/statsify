import { Constructor, flatten, FlattenKeys } from '@statsify/util';
import { getModelForClass } from '@typegoose/typegoose';

export class MongoLeaderboardService {
  public async getLeaderboard<T>(
    constructor: Constructor<T>,
    field: FlattenKeys<T>,
    selector: Record<string, boolean>,
    filter: Record<string, any>
  ): Promise<{ data: Record<string, any>; index: number }[] | null>;
  public async getLeaderboard<T>(
    constructor: Constructor<T>,
    field: FlattenKeys<T>,
    selector: Record<string, boolean>,
    top: number,
    bottom: number
  ): Promise<{ data: Record<string, any>; index: number }[]>;
  public async getLeaderboard<T>(
    constructor: Constructor<T>,
    field: FlattenKeys<T>,
    selector: Record<string, boolean>,
    topOrFilter: number | Record<string, any>,
    bottom?: number
  ): Promise<{ data: Record<string, any>; index: number }[] | null> {
    const model = getModelForClass(constructor);

    if (typeof topOrFilter === 'object') {
      const filter = topOrFilter;

      const item = (await model.findOne(filter).select(selector).lean().exec()) as T;

      if (!item) return null;

      const flatItem = flatten(item);
      const value = flatItem[field] as number;

      if (!value) return null;

      let limit = 11;

      const [higherData, ranking] = await Promise.all([
        model
          .find()
          .where(field as string)
          .gte(value)
          .select(selector)
          .sort({ [field]: -1 })
          .limit(Math.ceil(limit / 2))
          .lean()
          .exec(),
        this.getLeaderboardRanking(constructor, field, value),
      ]);

      if (!ranking) return null;

      const stringItem = JSON.stringify(item);

      const higher = higherData.filter((i) => JSON.stringify(i) !== stringItem);

      limit -= higher.length + 2;

      const lower = await model
        .find()
        .where(field as string)
        .lt(value)
        .select(selector)
        .sort({ [field]: -1 })
        .limit(limit)
        .lean()
        .exec();

      const position = ranking - higher.length;

      return [...higher, item, ...lower].map((data, index) => ({
        data: data as Record<string, any>,
        index: position + index,
      }));
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
    field: FlattenKeys<T>,
    filter: Record<string, any>
  ): Promise<number | null>;
  public async getLeaderboardRanking<T>(
    constructor: Constructor<T>,
    field: FlattenKeys<T>,
    value: number
  ): Promise<number | null>;
  public async getLeaderboardRanking<T>(
    constructor: Constructor<T>,
    field: FlattenKeys<T>,
    valueOrFilter: number | Record<string, any>
  ): Promise<number | null> {
    const model = getModelForClass(constructor);

    let value: number;

    if (typeof valueOrFilter === 'object') {
      const filter = valueOrFilter;

      const item = (await model
        .findOne(filter)
        .select({ [field]: true })
        .lean()
        .exec()) as T;

      if (!item) return null;

      value = flatten(item)[field] as number;
    } else {
      value = valueOrFilter;
    }

    return model
      .countDocuments()
      .where(field as string)
      .gte(value)
      .lean()
      .exec();
  }
}
