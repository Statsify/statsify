import { Command } from '@statsify/discord';
import { ArenaBrawlModes, ARENA_BRAWL_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { ArenaBrawlProfile } from './arenabrawl.profile';

@Command({ description: (t) => t('commands.arenabrawl') })
export class ArenaBrawlCommand extends BaseHypixelCommand<ArenaBrawlModes> {
  public constructor() {
    super(ARENA_BRAWL_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<ArenaBrawlModes, never>
  ): JSX.Element {
    return <ArenaBrawlProfile {...base} mode={mode} />;
  }
}
