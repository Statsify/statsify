import { ChoiceArgument, FileArgument } from '#arguments';
import { ApiService } from '#services';
import { Command, CommandContext, IMessage } from '@statsify/discord';
import { APIAttachment } from 'discord-api-types/v10';
import { Canvas, loadImage } from 'skia-canvas/lib';
import { ErrorMessage } from '../error.message';

@Command({
  description: (t) => t('commands.badge'),
  args: [new ChoiceArgument('mode', 'set', 'reset', 'view'), new FileArgument()],
  cooldown: 5,
})
export class BadgeCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const file = context.option<APIAttachment | null>('file');
    const mode = context.option<'view' | 'set' | 'reset'>('mode', file ? 'set' : 'view');
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

    switch (mode) {
      case 'view': {
        // Always show badge
        return {
          content: 'View',
        };
      }

      case 'set': {
        if (!file)
          throw new ErrorMessage(
            (t) => t('errors.missingFile.title'),
            (t) => t('errors.missingFile.description')
          );

        const canvas = new Canvas(32, 32);
        const ctx = canvas.getContext('2d');

        const badge = await loadImage(file.url);

        const ratio = Math.min(canvas.width / badge.width, canvas.height / badge.height);
        const scaled = badge.width > 32 || badge.height > 32;

        ctx.drawImage(
          badge,
          0,
          0,
          badge.width,
          badge.height,
          (canvas.width - badge.width) / 2,
          (canvas.height - badge.height) / 2,
          scaled ? badge.width * ratio : badge.width,
          scaled ? badge.height * ratio : badge.height
        );

        this.apiService.updateUserBadge(userId, await canvas.toBuffer('png'));

        return {
          content: 'Set',
        };
      }

      case 'reset': {
        // Always reset
        return {
          content: 'Reset',
        };
      }
    }
  }
}
