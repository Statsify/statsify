import { abbreviationNumber } from '@statsify/util';
import { readdir } from 'fs/promises';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

export class I18NextService {
  public static async init() {
    const defaultLanguage = 'en-US';

    const languages = await readdir('../../locales');

    const namespaces = (await readdir(`../../locales/${defaultLanguage}/discord-bot`)).map((p) =>
      p.replace('.json', '')
    );

    await i18next.use(Backend).init({
      backend: {
        loadPath: '../../locales/{{lng}}/discord-bot/{{ns}}.json',
      },
      debug: false,
      fallbackLng: defaultLanguage,
      lng: defaultLanguage,
      supportedLngs: languages,
      ns: namespaces,
      load: 'all',
      preload: languages,
      initImmediate: false,
      defaultNS: 'default',
      interpolation: {
        format: this.format,
        escapeValue: false,
      },
    });
  }

  private static format(value: any, format?: string | undefined, lng?: string): string {
    switch (format) {
      case 'number': {
        const digits = Number.isInteger(+value) ? 0 : 2;

        if ((value as number) >= 1_000_000) return abbreviationNumber(value);

        return Intl.NumberFormat(lng, {
          maximumFractionDigits: digits,
          minimumFractionDigits: digits,
        }).format(value as number);
      }
    }

    return value;
  }
}
