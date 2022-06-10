import { FileArgument } from '#arguments';
import { ApiService } from '#services';
import { Command, CommandContext, IMessage } from '@statsify/discord';
import { APIAttachment } from 'discord-api-types/v10';
import { Canvas, loadImage } from 'skia-canvas/lib';
import { ErrorMessage } from '../error.message';

@Command({
  description: (t) => t('commands.badge'),
  args: [FileArgument],
  cooldown: 5,
})
export class BadgeCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();

    if (!user?.uuid)
      throw new ErrorMessage(
        (t) => t('verification.requiredVerification.title'),
        (t) => t('verification.requiredVerification.description')
      );

    if (!user.premium)
      throw new ErrorMessage(
        (t) => t('errors.missingSelfPremium.title'),
        (t) => t('errors.missingSelfPremium.description')
      );

    const badgeFile = context.option<APIAttachment>('file');

    const canvas = new Canvas(32, 32);
    const ctx = canvas.getContext('2d');

    const badge = await loadImage(badgeFile.url);

    const hRatio = canvas.width / badge.width;
    const vRatio = canvas.height / badge.height;
    const ratio = Math.min(hRatio, vRatio);

    let width;
    let height;
    if (badge.width < 32 && badge.height < 32) {
      width = badge.width;
      height = badge.height;
    }

    ctx.drawImage(
      badge,
      0,
      0,
      badge.width,
      badge.height,
      (canvas.width - badge.width) / 2,
      (canvas.height - badge.height) / 2,
      width ?? badge.width * ratio,
      height ?? badge.height * ratio
    );

    this.apiService.updateUserBadge(userId, await canvas.toBuffer('png'));

    return {
      content: 'Updated',
    };
  }
}
