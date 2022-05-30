import { Command } from '@statsify/discord';
import { GeneralCommand } from './general.command';

@Command({ description: (t) => t('commands.general') })
export class HypixelCommand extends GeneralCommand {}
