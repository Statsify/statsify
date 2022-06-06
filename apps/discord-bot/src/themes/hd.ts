import { BaseThemeContext, IntrinsicRenders, Theme } from '@statsify/rendering';
import Container from 'typedi';

const context: BaseThemeContext = {
  renderer: Container.get('HDFontRenderer'),
};

const elements: Partial<IntrinsicRenders<BaseThemeContext>> = {};

export const hdTheme: Theme<BaseThemeContext> = {
  context,
  elements,
};
