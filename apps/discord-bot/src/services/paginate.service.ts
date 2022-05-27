import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  InteractionContent,
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

export type PaginateInteractionContentGenerator = {
  label: LocalizationString;
  generator: (
    t: LocalizeFunction
  ) => PaginateInteractionContent | Promise<PaginateInteractionContent>;
};

type PageController = ButtonBuilder[] | [SelectMenuBuilder];

@Service()
export class PaginateService {
  public async paginate(
    context: CommandContext,
    pages: PaginateInteractionContentGenerator[],
    timeout = 300000
  ) {
    if (pages.length === 1) return context.reply(await this.getMessage(context, [], 0, pages));

    const userId = context.getInteraction().getUserId();

    const cache = new Map<number, InteractionContent>();
    let index = 0;

    const controller = this.getPageController(pages, index);

    const listener = CommandListener.getInstance();

    controller.forEach((component, i) => {
      listener.addInteractionHook(component.getCustomId(), async (interaction) => {
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
          return context.reply(message);
        }

        return interaction.sendFollowup({ ...message, components: [], ephemeral: true });
      });
    });

    setTimeout(() => {
      controller.forEach((component) => listener.removeInteractionHook(component.getCustomId()));

      context.reply({
        ...cache.get(index)!,
        components: [],
      });
    }, timeout);

    const message = await this.getMessage(context, controller, index, pages);
    cache.set(index, message);

    context.reply(message);
  }

  private getPageController(
    pages: PaginateInteractionContentGenerator[],
    index: number
  ): PageController {
    if (pages.length > 5) {
      const controller = new SelectMenuBuilder();

      pages.forEach((page, i) => {
        controller.option(
          new SelectMenuOptionBuilder()
            .label(page.label)
            .value(`${i}`)
            .default(i === index)
        );
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
    pages: PaginateInteractionContentGenerator[]
  ) {
    this.setActiveControl(controller, index);

    const t = context.t();
    const pageContent = await pages[index].generator(t);

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

    page.components = [new ActionRowBuilder(controller)];

    return page.build(t);
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
