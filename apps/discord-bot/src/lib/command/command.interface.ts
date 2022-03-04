import type { Constructor } from '@statsify/util';

export interface CommandMetadata {
  name: string;
  description: string;
  groups?: Constructor<any>[];
  args?: Constructor<any>[];
  cooldown?: number;
}

export type SubCommandMetadata = Omit<CommandMetadata, 'groups'>;

export interface CommandOptions extends Omit<CommandMetadata, 'name'> {
  name?: string;
}

export type SubCommandOptions = Omit<CommandOptions, 'groups'>;
