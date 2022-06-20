/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIEmbed } from 'discord-api-types/v10';
import i18next from 'i18next';
import { EmbedBuilder } from '../src';
import { getLocalizeFunction } from '../src/messages/localize';

describe('EmbedBuilder', () => {
  it('should create an embed', () => {
    const embed = new EmbedBuilder()
      .title('title')
      .description('description')
      .footer('footerText', 'footerIconUrl')
      .field('fieldName', 'fieldValue')
      .fields(['fieldName2', 'fieldValue2', true])
      .color(0x000000)
      .image('image')
      .author('authorName', 'authorIcon', 'authorUrl')
      .thumbnail('thumbnail')
      .url('url')
      .build(getLocalizeFunction(i18next.language));

    expect(embed).toEqual<APIEmbed>({
      title: 'title',
      description: 'description',
      footer: { text: 'footerText', icon_url: 'footerIconUrl' },
      fields: [
        { name: 'fieldName', value: 'fieldValue', inline: false },
        { name: 'fieldName2', value: 'fieldValue2', inline: true },
      ],
      color: 0x000000,
      image: {
        url: 'image',
      },
      author: {
        name: 'authorName',
        icon_url: 'authorIcon',
        url: 'authorUrl',
      },
      thumbnail: {
        url: 'thumbnail',
      },
      url: 'url',
    });
  });
});
