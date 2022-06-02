import { BaseProfileProps } from '#profiles/base.profile';
import { VampireZProfile } from '#profiles/vampirez.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { VampireZModes, VAMPIREZ_MODES } from '@statsify/schemas';
import { BaseHypixelCommand } from './base.hypixel-command';

@Command({ description: (t) => t('commands.vampirez') })
export class VampireZCommand extends BaseHypixelCommand<VampireZModes> {
  public constructor() {
    super(VAMPIREZ_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.ElementNode {
    return <VampireZProfile {...base} />;
  }
}
