import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { MegaWallsModes, MEGAWALLS_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { MegaWallsProfile } from './megawalls.profile';

@Command({ description: (t) => t('commands.megawalls') })
export class MegaWallsCommand extends BaseHypixelCommand<MegaWallsModes> {
  public constructor() {
    super(MEGAWALLS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<MegaWallsModes, never>
  ): JSX.ElementNode {
    return <MegaWallsProfile {...base} mode={mode} />;
  }
}
