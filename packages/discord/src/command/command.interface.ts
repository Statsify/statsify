import type { Constructor } from '@statsify/util';
import type { Argument } from '../arguments';

export interface CommandMetadata {
  name: string;
  description: string;
  groups?: Constructor<any>[];
  args?: Argument[];
  cooldown?: number;
}

export type SubCommandMetadata = Omit<CommandMetadata, 'groups'>;

export interface CommandOptions extends Omit<CommandMetadata, 'name'> {
  name?: string;
}

export type SubCommandOptions = Omit<CommandOptions, 'groups'>;
