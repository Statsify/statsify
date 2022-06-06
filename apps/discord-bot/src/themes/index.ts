import { Theme } from '@statsify/rendering';
import { UserTheme } from '@statsify/schemas';
import { hdTheme } from './hd';

export const getTheme = (theme: UserTheme = UserTheme.DEFAULT): Theme<any> | undefined => {
  switch (theme) {
    case UserTheme.HD:
      return hdTheme;
    case UserTheme.DEFAULT:
    default:
      return undefined;
  }
};
