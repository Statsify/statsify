export type APIData = Record<string, any>;

export type Constructor<T = any> = new (...args: any[]) => T;

export const noop = <T>() => null as unknown as T;

export const findScoreIndex = <T extends { req: number }>(data: T[], score = 0): number => {
  return data.findIndex(
    ({ req }, index, arr) =>
      score >= req && ((arr[index + 1] && score < arr[index + 1].req) || !arr[index + 1])
  );
};

export const findScore = <T extends { req: number }>(data: T[], score = 0): T => {
  return data[findScoreIndex(data, score)];
};
