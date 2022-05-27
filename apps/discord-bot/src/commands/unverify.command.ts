import { SUCCESS_COLOR } from '#constants';
import { ApiService } from '#services';
import { Command, CommandContext, EmbedBuilder, IMessage } from '@statsify/discord';
import { ErrorMessage } from '../error.message';

@Command({ description: 'Displays a message', cooldown: 5 })
export class UnverifyCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();

    if (!user?.uuid)
      throw new ErrorMessage(
        (t) => t('verification.notVerified.title'),
        (t) => t('verification.notVerified.description')
      );

    await this.apiService.unverifyUser(userId);

    const embed = new EmbedBuilder()
      .description((t) => t('verification.successfulUnverification'))
      .color(SUCCESS_COLOR);

    return {
      embeds: [embed],
    };
  }
}
