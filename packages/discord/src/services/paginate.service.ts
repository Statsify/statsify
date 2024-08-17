/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ButtonStyle } from "discord-api-types/v10";
import { Canvas } from "skia-canvas";
import { Service } from "typedi";

import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  type IMessage,
  type LocalizationString,
  type LocalizeFunction,
  Message,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
} from "#messages";
import { Interaction } from "#interaction";
import type { AbstractCommandListener, CommandContext, InteractionHook } from "#command";

type PaginateInteractionContent = IMessage | Message | EmbedBuilder | Canvas;

type PaginateInteractionContentGenerator = (
  t: LocalizeFunction
) => PaginateInteractionContent | Promise<PaginateInteractionContent>;

export type Page = PageInput & ({ subPages: SubPage[] } | { generator: PaginateInteractionContentGenerator });
export type SubPage = PageInput & { generator: PaginateInteractionContentGenerator };

interface PageInput {
  label: LocalizationString;
  emoji?: LocalizationString | false;
}

type PageId = `${number}|${number}`;

@Service()
export class PaginateService {
  /**
   *
   * @param context The context of the command
   * @param pages The array of pages to paginate against
   * @param timeout When to stop the pagination (ms), defaults to 300000
   */
  public async paginate(context: CommandContext, pages: Page[], timeout = 300_000) {
    const cache = new Map<PageId, Message>();
    const t = context.t();

    const getMessage = async (index: number, subIndex: number) => {
      const pageId: PageId = `${index}|${subIndex}`;
      if (cache.has(pageId)) return cache.get(pageId)!;

      const page = pages[index];
      let content: PaginateInteractionContent;

      if ("subPages" in page) {
        const subPage = page.subPages[subIndex];
        content = await subPage.generator(t);
      } else {
        content = await page.generator(t);
      }

      const message = await this.toMessage(content);
      cache.set(pageId, message);

      return message;
    };

    // If there is only one page with no sub pages, return the message immediately without pagination
    if (pages.length === 1 && "generator" in pages[0]) return getMessage(0, 0);

    const userId = context.getInteraction().getUserId();
    const listener = context.getListener();

    let currentIndex = 0;
    let currentSubIndex = 0;

    const mainController = new PageController(pages, currentIndex);

    const page = pages[currentIndex];
    let subController = "subPages" in page && page.subPages.length > 1 ? new PageController(page.subPages, currentSubIndex) : undefined;

    mainController.register(listener, (interaction, index) => handler(interaction, index, 0));
    subController?.register(listener, (interaction, subIndex) => handler(interaction, currentIndex, subIndex));

    async function handler(interaction: Interaction, index: number, subIndex: number) {
      interaction.setLocale(t.locale);

      // Send an ephemeral preview if the user is not the one who initiated the interaction
      if (interaction.getUserId() !== userId) {
        const message = await getMessage(index, subIndex);
        return interaction.sendFollowup({ ...message, components: [], ephemeral: true });
      }

      if (index !== currentIndex) {
        // [TODO]: remove all hooks for sub pages
        subController?.unregister(listener);
        mainController.switchPage(index);

        currentIndex = index;
        currentSubIndex = 0;

        if ("subPages" in pages[index] && pages[index].subPages.length > 1) {
          subController = new PageController(pages[index].subPages, currentSubIndex);
          subController.register(listener, (interaction, subIndex) => handler(interaction, currentIndex, subIndex));
        } else {
          subController = undefined;
        }
      } else if (subIndex !== currentSubIndex) {
        subController?.switchPage(subIndex);
        currentSubIndex = subIndex;
      }

      const message = await getMessage(index, subIndex);

      message.components = [mainController.getActionRow(), subController?.getActionRow()]
        .filter((row) => row !== undefined);

      return context.reply(message);
    }

    function onTimeout() {
      mainController.unregister(listener);
      subController?.unregister(listener);
      cache.clear();
      return context.reply({ components: [] });
    }

    setTimeout(onTimeout, timeout);

    const message = await getMessage(currentIndex, currentSubIndex);
    message.components = [mainController.getActionRow(), subController?.getActionRow()]
      .filter((row) => row !== undefined);

    return message;
  }

  /**
   *
   * @param context The context of the command
   * @param pages The array of pages to paginate against
   * @param forwardButton The button to use for forward pagination
   * @param backwardButton The button to use for back pagination
   * @param invertButtons Whether to invert the buttons (backward becomes forward, forward becomes backward)
   * @param startingIndex  The starting page
   * @param timeout When to stop the pagination (ms), defaults to 300000
   */
  public async scrollingPagination(
    context: CommandContext,
    pages: PaginateInteractionContentGenerator[],
    forwardButton?: ButtonBuilder,
    backwardButton?: ButtonBuilder,
    invertButtons = false,
    startingIndex = 0,
    timeout = 300_000
  ) {
    const currentIndex = startingIndex;
    const cache = new Map<number, Message>();
    const t = context.t();

    const getMessage = async (index: number) => {
      if (cache.has(index)) return cache.get(index)!;

      const content = await pages[index](t);
      const message = await this.toMessage(content);
      cache.set(index, message);

      return message;
    };

    if (pages.length === 1) return getMessage(currentIndex);

    const userId = context.getInteraction().getUserId();

    const controller = [
      backwardButton ?? new ButtonBuilder().emoji(t("emojis:backward")),
      forwardButton ?? new ButtonBuilder().emoji(t("emojis:forward")),
    ];

    if (invertButtons) controller.reverse();

    const listener = context.getListener();

    controller.forEach((component, i) => {
      listener.addHook(component.getCustomId(), async (interaction) => {
        interaction.setLocale(t.locale);

        let page: number;

        if (i === 0) {
          // Backwards
          page = startingIndex == 0 ? pages.length - 1 : startingIndex - 1;
        } else {
          // Forwards
          page = startingIndex == pages.length - 1 ? 0 : startingIndex + 1;
        }

        const message = await getMessage(page);

        if (interaction.getUserId() === userId) {
          startingIndex = page;
          message.components = [new ActionRowBuilder(controller)];
          return context.reply(message);
        }

        return interaction.sendFollowup({ ...message, components: [], ephemeral: true });
      });
    });

    function onTimeout() {
      controller.forEach((component) => listener.removeHook(component.getCustomId()));
      context.reply({ components: [] });
      cache.clear();
    }

    setTimeout(onTimeout, timeout);

    const message = await getMessage(startingIndex);
    message.components = [new ActionRowBuilder(controller)];

    return message;
  }

  private async toMessage(content: PaginateInteractionContent): Promise<Message> {
    if (content instanceof Message) return content;
    if (content instanceof EmbedBuilder) return new Message({ embeds: [content] });
    if (content instanceof Canvas) return new Message({
      files: [{ name: "image.png", data: await content.toBuffer("png"), type: "image/png" }],
      attachments: [],
    });

    return new Message(content);
  }
}

class PageController {
  #menu: SelectMenuBuilder | ButtonBuilder[];

  public constructor(pages: PageInput[], selected: number) {
    if (pages.length > 5) {
      const menu = new SelectMenuBuilder();

      pages.forEach((page, index) => {
        const option = new SelectMenuOptionBuilder().label(page.label).value(`${index}`);
        if (page.emoji) option.emoji(page.emoji);
        menu.option(option);
      });

      menu.activeOption(selected);
      this.#menu = menu;
    } else {
      this.#menu = pages.map((page, index) => {
        const button = new ButtonBuilder().label(page.label).style(ButtonStyle.Secondary);
        if (page.emoji) button.emoji(page.emoji);
        if (index === selected) button.style(ButtonStyle.Primary);
        return button;
      });
    }
  }

  public switchPage(index: number) {
    if (this.#menu instanceof SelectMenuBuilder) {
      this.#menu.activeOption(index);
      return;
    }

    this.#menu.forEach((button, i) => button.style(i === index ? ButtonStyle.Primary : ButtonStyle.Secondary));
  }

  public getActionRow(): ActionRowBuilder {
    if (this.#menu instanceof SelectMenuBuilder) return new ActionRowBuilder([this.#menu]);
    return new ActionRowBuilder(this.#menu);
  }

  public register(
    listener: AbstractCommandListener,
    handler: (interaction: Interaction, index: number) => ReturnType<InteractionHook>
  ) {
    if (this.#menu instanceof SelectMenuBuilder) {
      return listener.addHook(this.#menu.getCustomId(), (interaction) => {
        const index = Number(interaction.getData().values[0]);
        return handler(interaction, index);
      });
    }

    this.#menu.forEach((button, index) => {
      listener.addHook(button.getCustomId(), (interaction) => handler(interaction, index));
    });
  }

  public unregister(listener: AbstractCommandListener) {
    if (this.#menu instanceof SelectMenuBuilder) listener.removeHook(this.#menu.getCustomId());
    else this.#menu.forEach((button) => listener.removeHook(button.getCustomId()));
  }
}
