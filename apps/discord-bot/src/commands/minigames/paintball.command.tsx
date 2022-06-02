import { BaseProfileProps } from '#profiles/base.profile';
import { PaintballProfile } from '#profiles/paintball.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { PaintballModes, PAINTBALL_MODES } from '@statsify/schemas';
import { BaseHypixelCommand } from './base.hypixel-command';

@Command({ description: (t) => t('commands.paintball') })
export class PaintballCommand extends BaseHypixelCommand<PaintballModes> {
  public constructor() {
    super(PAINTBALL_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.ElementNode {
    return <PaintballProfile {...base} />;
  }
}
