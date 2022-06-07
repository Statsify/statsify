import type { Constructor } from '@statsify/util';
import type { AbstractArgument } from '../arguments';
import { LocalizationString } from '../messages';

export interface CommandOptions {
  name?: string;
  description: LocalizationString;
  groups?: Constructor<any>[];
  args?: (AbstractArgument | Constructor<AbstractArgument>)[];
  cooldown?: number;
}

export type SubCommandOptions = Omit<CommandOptions, 'groups' | 'cooldown'>;

export interface CommandMetadata extends Omit<CommandOptions, 'name'> {
  name: string;
  methodName: string;
}

export type SubCommandMetadata = Record<string, Omit<CommandMetadata, 'groups'>>;
