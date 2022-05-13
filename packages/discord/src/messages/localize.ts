import { TFunction, TFunctionResult } from 'i18next';

export type LocalizationString = string | number | ((t: TFunction) => TFunctionResult);

const shouldTranslate = (str: LocalizationString): boolean => {
  const type = typeof str;
  return type === 'function' || type === 'number';
};

export const translateField = <T extends string>(
  locale: TFunction,
  str?: LocalizationString
): T => {
  if (typeof str === 'undefined') return str as unknown as T;
  if (typeof str === 'string') return str as T;

  if (typeof str === 'number') {
    const isInt = Number.isInteger(str);
    return locale(`${isInt ? 'int' : 'double'}`, { value: str, lng: 'en-GB' });
  }

  return str(locale) as T;
};

export const translateObject = <T extends Record<string, LocalizationString | any>>(
  locale: TFunction,
  obj?: T
): { [key in keyof T]: T[key] extends LocalizationString ? string : T[key] } => {
  if (typeof obj === 'undefined') return obj as unknown as { [key in keyof T]: T[key] };

  for (const key in obj) {
    obj[key] = shouldTranslate(obj[key]) ? translateField(locale, obj[key]) : obj[key];
  }

  return obj;
};
