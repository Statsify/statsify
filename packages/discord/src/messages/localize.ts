import {
  StringMap,
  TFunctionDetailedResult,
  TFunctionKeys,
  TFunctionResult,
  TOptions,
} from 'i18next';

export interface LocalizeFunction {
  // basic usage
  <
    TResult extends TFunctionResult = string,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: TKeys | TKeys[]
  ): TResult;
  <
    TResult extends TFunctionResult = TFunctionDetailedResult<object>,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: TKeys | TKeys[],
    options?: TOptions<TInterpolationMap> & { returnDetails: true; returnObjects: true }
  ): TResult;
  <
    TResult extends TFunctionResult = TFunctionDetailedResult,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: TKeys | TKeys[],
    options?: TOptions<TInterpolationMap> & { returnDetails: true }
  ): TResult;
  <
    TResult extends TFunctionResult = object,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: TKeys | TKeys[],
    options?: TOptions<TInterpolationMap> & { returnObjects: true }
  ): TResult;
  <
    TResult extends TFunctionResult = string,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: TKeys | TKeys[],
    options?: TOptions<TInterpolationMap> | string
  ): TResult;
  // overloaded usage
  <
    TResult extends TFunctionResult = string,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: TKeys | TKeys[],
    defaultValue?: string,
    options?: TOptions<TInterpolationMap> | string
  ): TResult;
  <
    TResult extends TFunctionResult = string,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: number
  ): TResult;
}
export type LocalizationString = string | number | ((t: LocalizeFunction) => TFunctionResult);

const shouldTranslate = (str: LocalizationString): boolean => {
  const type = typeof str;
  return type === 'function' || type === 'number';
};

export const translateField = <T extends string>(
  locale: LocalizeFunction,
  str?: LocalizationString
): T => {
  if (typeof str === 'undefined') return str as unknown as T;
  if (typeof str === 'string') return str as T;
  if (typeof str === 'number') return locale('number', { value: str }) as T;

  return str(locale) as T;
};

export const translateObject = <T extends Record<string, LocalizationString | any>>(
  locale: LocalizeFunction,
  obj?: T
): { [key in keyof T]: T[key] extends LocalizationString ? string : T[key] } => {
  if (typeof obj === 'undefined') return obj as unknown as { [key in keyof T]: T[key] };

  for (const key in obj) {
    obj[key] = shouldTranslate(obj[key]) ? translateField(locale, obj[key]) : obj[key];
  }

  return obj;
};
