import type { Constructor } from '@statsify/util';
import type { AbstractArgument } from '../arguments';

export interface CommandOptions {
  name?: string;
  description: string;
  groups?: Constructor<any>[];
  args?: (AbstractArgument | Constructor<AbstractArgument>)[];
  cooldown?: number;
}

export type SubCommandOptions = Omit<CommandOptions, 'groups'>;

export interface CommandMetadata extends Omit<CommandOptions, 'name'> {
  name: string;
  methodName: string;
}

export type SubCommandMetadata = Omit<CommandMetadata, 'groups'>;
