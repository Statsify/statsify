import type { Constructor } from '@statsify/util';
import type { Argument } from '../arguments';

export interface CommandOptions {
  name?: string;
  description: string;
  groups?: Constructor<any>[];
  args?: Argument[];
  cooldown?: number;
}

export type SubCommandOptions = Omit<CommandOptions, 'groups'>;

export interface CommandMetadata extends Omit<CommandOptions, 'name'> {
  name: string;
  methodName: string;
}

export type SubCommandMetadata = Omit<CommandMetadata, 'groups'>;
