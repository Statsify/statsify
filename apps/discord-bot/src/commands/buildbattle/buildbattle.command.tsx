import { Command } from '@statsify/discord';
import { BuildBattleModes, BUILD_BATTLE_MODES } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps } from '../base.hypixel-command';
import { BuildBattleProfile } from './buildbattle.profile';

@Command({ description: (t) => t('commands.buildbattle') })
export class BuildBattleCommand extends BaseHypixelCommand<BuildBattleModes> {
  public constructor() {
    super(BUILD_BATTLE_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <BuildBattleProfile {...base} />;
  }
}
