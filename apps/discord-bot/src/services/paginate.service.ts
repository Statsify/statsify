/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  Message,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  type CommandContext,
  type IMessage,
  type LocalizationString,
  type LocalizeFunction,
} from '@statsify/discord';
import { ButtonStyle } from 'discord-api-types/v10';
import { Canvas } from 'skia-canvas';
import { Service } from 'typedi';
import { CommandListener } from '../command.listener';

type PaginateInteractionContent = IMessage | Message | EmbedBuilder | Canvas;

type PaginateInteractionContentGenerator = (
  t: LocalizeFunction
) => PaginateInteractionContent | Promise<PaginateInteractionContent>;

export interface Page {
  label: LocalizationString;
  emoji?: string;
  generator: PaginateInteractionContentGenerator;
}

type PageController = ButtonBuilder[] | [SelectMenuBuilder];

@Service()
export class PaginateService {
  /**
   *
   * @param context The context of the command
   * @param pages The array of pages to paginate against
   * @param timeout When to stop the pagination (ms), defaults to 300000
   */
  public async paginate(context: CommandContext, pages: Page[], timeout = 300000) {
    if (pages.length === 1) return context.reply(await this.getMessage(context, [], 0, pages));

    const userId = context.getInteraction().getUserId();

    const cache = new Map<number, Message>();
    let index = 0;

    const controller = this.getPageController(pages, index);

    const listener = CommandListener.getInstance();

    controller.forEach((component, i) => {
      listener.addHook(component.getCustomId(), async (interaction) => {
        let page = 0;

        if (interaction.isButtonInteraction()) page = i;
        else if (interaction.isSelectMenuInteraction())
          page = Number(interaction.getData().values[0]);

        const message = cache.has(page)
          ? cache.get(page)!
          : await this.getMessage(context, controller, page, pages);

        cache.set(page, message);

        if (interaction.getUserId() === userId) {
          index = page;
          this.setActiveControl(controller, index);
          return context.reply(message);
        }

        return interaction.sendFollowup({ ...message, components: [], ephemeral: true });
      });
    });

    setTimeout(() => {
      controller.forEach((component) => listener.removeHook(component.getCustomId()));

      context.reply({
        components: [],
      });

      cache.clear();
    }, timeout);

    const message = await this.getMessage(context, controller, index, pages);
    cache.set(index, message);

    context.reply(message);
  }

  /**
   *
   * @param context The context of the command
   * @param pages The array of pages to paginate against
   * @param index  The starting page
   * @param timeout When to stop the pagination (ms), defaults to 300000
   */
  public async scrollingPagination(
    context: CommandContext,
    pages: PaginateInteractionContentGenerator[],
    index = 0,
    timeout = 300000
  ) {
    const userId = context.getInteraction().getUserId();
    const cache = new Map<number, Message>();

    const controller = [
      new ButtonBuilder().label('backward'),
      new ButtonBuilder().label('forward'),
    ];

    const listener = CommandListener.getInstance();

    controller.forEach((component, i) => {
      listener.addHook(component.getCustomId(), async (interaction) => {
        let page: number;

        if (i === 0) {
          //Backwards
          page = index == 0 ? pages.length - 1 : index - 1;
        } else {
          //Forwards
          page = index == pages.length - 1 ? 0 : index + 1;
        }

        const message = cache.has(page)
          ? cache.get(page)!
          : await this.getMessage(context, controller, page, pages);

        cache.set(page, message);

        if (interaction.getUserId() === userId) {
          // eslint-disable-next-line require-atomic-updates
          index = page;
          return context.reply(message);
        }

        return interaction.sendFollowup({ ...message, components: [], ephemeral: true });
      });
    });

    setTimeout(() => {
      controller.forEach((component) => listener.removeHook(component.getCustomId()));

      context.reply({
        components: [],
      });

      cache.clear();
    }, timeout);

    const message = await this.getMessage(context, controller, index, pages);
    cache.set(index, message);

    context.reply(message);
  }

  private getPageController(pages: Page[], index: number): PageController {
    if (pages.length > 5) {
      const controller = new SelectMenuBuilder();

      pages.forEach((page, i) => {
        const menu = new SelectMenuOptionBuilder()
          .label(page.label)
          .value(`${i}`)
          .default(i === index);

        if (page.emoji) menu.emoji(page.emoji);
        controller.option(menu);
      });

      return [controller];
    }

    return pages.map(({ label }, i) =>
      new ButtonBuilder()
        .label(label)
        .style(i === index ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );
  }

  private async getMessage(
    context: CommandContext,
    controller: PageController,
    index: number,
    pages: Page[] | PaginateInteractionContentGenerator[]
  ): Promise<Message> {
    const t = context.t();
    const content = pages[index];
    const isScrolling = typeof content === 'function';
    const pageContent = await (isScrolling ? content(t) : content.generator(t));

    let page: Message;

    if (pageContent instanceof Message) {
      page = pageContent;
    } else if (pageContent instanceof EmbedBuilder) {
      page = new Message({ embeds: [pageContent] });
    } else if (pageContent instanceof Canvas) {
      page = new Message({
        files: [{ name: 'image.png', data: await pageContent.toBuffer('png'), type: 'image/png' }],
        attachments: [],
      });
    } else {
      page = new Message(pageContent);
    }

    if (controller.length && pages.length > 1) {
      page.components = [new ActionRowBuilder(controller)];
    }

    return page;
  }

  private setActiveControl(controller: PageController, index: number) {
    if (controller.length === 1) {
      (controller[0] as SelectMenuBuilder).activeOption(index);
      return;
    }

    controller.forEach((component, i) =>
      (component as ButtonBuilder).style(i === index ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );
  }
}
