import { abbreviationNumber } from '@statsify/util';
import { readdir } from 'fs/promises';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { Service } from 'typedi';

@Service()
export class I18nLoaderService {
  private DEFAULT_LANGUAGE = 'en-US';
  private languages: string[] = [];
  private namespaces: string[] = [];

  public async init() {
    this.languages = await readdir('../../locales');
    this.namespaces = (await readdir(`../../locales/${this.DEFAULT_LANGUAGE}/discord-bot`)).map(
      (p) => p.replace('.json', '')
    );

    await i18next.use(Backend).init({
      backend: {
        loadPath: '../../locales/{{lng}}/discord-bot/{{ns}}.json',
      },
      debug: false,
      fallbackLng: this.DEFAULT_LANGUAGE,
      lng: this.DEFAULT_LANGUAGE,
      supportedLngs: this.languages,
      ns: this.namespaces,
      load: 'all',
      preload: this.languages,
      initImmediate: false,
      defaultNS: 'default',
      interpolation: {
        format: this.format,
        escapeValue: false,
      },
    });
  }

  private format(value: any, format?: string | undefined, lng?: string): string {
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
