import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandContext,
  InteractionContent,
} from '@statsify/discord';
import { Service } from 'typedi';
import { CommandListener } from '../command.listener';

export type PaginateInteractionContent = Omit<InteractionContent, 'components'>;

@Service()
export class PaginateService {
  /**
   *
   * @param context The command context
   * @param pages An array of pages to pagination through
   * @param page The starting page
   * @param timeout The time in milliseconds to wait before automatically stopping the pagination
   */
  public async paginate(
    context: CommandContext,
    pages: PaginateInteractionContent[],
    page = 0,
    timeout = 300000
  ) {
    let content = pages[page];

    const backward = new ButtonBuilder().label('backward');
    const forward = new ButtonBuilder().label('forward');

    const row = new ActionRowBuilder().component(backward).component(forward).build(context.t);

    const listener = CommandListener.getInstance();

    listener.addInteractionHook(backward.getCustomId(), () => {
      page = page == 0 ? pages.length - 1 : page - 1;
      content = pages[page];

      context.reply(content);
    });

    listener.addInteractionHook(forward.getCustomId(), async () => {
      page = page == pages.length - 1 ? 0 : page + 1;
      content = pages[page];

      context.reply(content);
    });

    setTimeout(() => {
      listener.removeInteractionHook(backward.getCustomId());
      listener.removeInteractionHook(forward.getCustomId());

      context.reply({
        ...content,
        components: [],
      });
    }, timeout);

    context.reply({
      ...content,
      components: [row],
    });
  }
}
