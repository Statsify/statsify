export type MockClass<T> = {
  [key in keyof T]: T[key];
};
