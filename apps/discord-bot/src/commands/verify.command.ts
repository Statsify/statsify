import { TextArgument } from '#arguments';
import { SUCCESS_COLOR } from '#constants';
import { ApiService } from '#services';
import { Command, CommandContext, EmbedBuilder, IMessage } from '@statsify/discord';
import { ErrorMessage } from '../error.message';

@Command({
  description: 'Displays a message',
  args: [new TextArgument('code', 'HI', false)],
  cooldown: 5,
})
export class VerifyCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    let user = context.getUser();

    if (user?.uuid)
      throw new ErrorMessage(
        (t) => t('verification.alreadyVerified.title'),
        (t) => t('verification.alreadyVerified.description')
      );

    const code = context.option<string>('code');

    if (!code)
      throw new ErrorMessage(
        (t) => t('verification.noCode.title'),
        (t) => t('verification.noCode.description')
      );

    user = await this.apiService.verifyUser(code, userId);

    if (!user)
      throw new ErrorMessage(
        (t) => t('verification.invalidCode.title'),
        (t) => t('verification.invalidCode.description')
      );

    const player = await this.apiService.getPlayer(user?.uuid as string);

    const embed = new EmbedBuilder()
      .description((t) =>
        t('verification.successfulVerification', { displayName: player.displayName })
      )
      .color(SUCCESS_COLOR);

    return {
      embeds: [embed],
    };
  }
}
