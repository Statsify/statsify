import { BaseProfileProps } from '#profiles/base.profile';
import { MurderMysteryProfile } from '#profiles/murdermystery.profile';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { MurderMysteryModes, MURDER_MYSTERY_MODES } from '@statsify/schemas';
import { BaseHypixelCommand } from './base.hypixel-command';

@Command({ description: (t) => t('commands.murdermystery') })
export class MurderMysteryCommand extends BaseHypixelCommand<MurderMysteryModes> {
  public constructor() {
    super(MURDER_MYSTERY_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.ElementNode {
    return <MurderMysteryProfile {...base} />;
  }
}
