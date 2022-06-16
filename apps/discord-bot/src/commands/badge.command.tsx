import { FileArgument } from '#arguments';
import { Container, Footer, HeaderNametag, Skin } from '#components';
import { ApiService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext, IMessage, LocalizeFunction, SubCommand } from '@statsify/discord';
import { render } from '@statsify/rendering';
import { User } from '@statsify/schemas';
import { APIAttachment } from 'discord-api-types/v10';
import { Canvas, Image, loadImage } from 'skia-canvas/lib';
import { ErrorMessage } from '../error.message';
import { getTheme } from '../themes';

@Command({ description: (t) => t('commands.badge') })
export class BadgeCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({
    description: (t) => t('commands.badge.view'),
  })
  public view(context: CommandContext) {
    return this.run(context, 'view');
  }

  @SubCommand({
    description: (t) => t('commands.badge.set'),
    args: [new FileArgument('badge', true)],
  })
  public set(context: CommandContext) {
    return this.run(context, 'set');
  }

  @SubCommand({
    description: (t) => t('commands.badge.reset'),
  })
  public reset(context: CommandContext) {
    return this.run(context, 'reset');
  }

  private async run(context: CommandContext, mode: 'view' | 'set' | 'reset'): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const file = context.option<APIAttachment | null>('badge');
    const user = context.getUser();
    const t = context.t();

    if (!user?.uuid)
      throw new ErrorMessage(
        (t) => t('verification.requiredVerification.title'),
        (t) => t('verification.requiredVerification.description')
      );

    if (!User.isPremium(user.tier))
      throw new ErrorMessage(
        (t) => t('errors.missingSelfPremium.title'),
        (t) => t('errors.missingSelfPremium.description')
      );

    switch (mode) {
      case 'view': {
        const badge = await this.apiService.getUserBadge(userId);

        if (!badge)
          throw new ErrorMessage(
            (t) => t('errors.unknown.title'),
            (t) => t('errors.unknown.description')
          );

        const profile = await this.getProfile(t, user, badge);

        return {
          content: t('config.badge.view') as string,
          files: [{ name: 'badge.png', data: profile, type: 'image/png' }],
        };
      }

      case 'set': {
        if (!file)
          throw new ErrorMessage(
            (t) => t('errors.unknown.title'),
            (t) => t('errors.unknown.description')
          );

        const canvas = new Canvas(32, 32);
        const ctx = canvas.getContext('2d');

        if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.content_type ?? ''))
          throw new ErrorMessage(
            (t) => t('errors.unsupportedFileType.title'),
            (t) => t('errors.unsupportedFileType.description')
          );

        const badge = await loadImage(file.url);

        const ratio = Math.min(canvas.width / badge.width, canvas.height / badge.height);
        const scaled = badge.width > 32 || badge.height > 32;

        const width = scaled ? badge.width * ratio : badge.width;
        const height = scaled ? badge.height * ratio : badge.height;

        ctx.drawImage(
          badge,
          0,
          0,
          badge.width,
          badge.height,
          (canvas.width - width) / 2,
          (canvas.height - height) / 2,
          width,
          height
        );

        await this.apiService.updateUserBadge(userId, await canvas.toBuffer('png'));
        const profile = await this.getProfile(t, user, canvas);

        return {
          content: t('config.badge.set') as string,
          files: [{ name: 'badge.png', data: profile, type: 'image/png' }],
        };
      }

      case 'reset': {
        await this.apiService.deleteUserBadge(userId);
        const badge = await this.apiService.getUserBadge(userId);

        const profile = await this.getProfile(t, user, badge);

        return {
          content: t('config.badge.reset') as string,
          files: [{ name: 'badge.png', data: profile, type: 'image/png' }],
        };
      }
    }
  }

  private async getProfile(t: LocalizeFunction, user: User, badge?: Image | Canvas) {
    if (!user?.uuid)
      throw new ErrorMessage(
        (t) => t('errors.unknown.title'),
        (t) => t('errors.unknown.description')
      );

    const [player, skin, logo, background] = await Promise.all([
      this.apiService.getPlayer(user.uuid),
      this.apiService.getPlayerSkin(user.uuid),
      getLogo(user.tier),
      getBackground('hypixel', 'overall'),
    ]);

    const canvas = render(
      <Container background={background}>
        <div width="100%">
          <Skin skin={skin} />
          <div direction="column" width="remaining" height="100%">
            <HeaderNametag name={player.displayName} badge={badge} size={3} />
            <box width="100%">
              <text>{t('config.badge.profile') as string}</text>
            </box>
            <Footer logo={logo} tier={user.tier}></Footer>
          </div>
        </div>
      </Container>,
      getTheme(user?.theme)
    );

    return canvas.toBuffer('png');
  }
}
