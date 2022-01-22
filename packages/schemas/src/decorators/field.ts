import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Constructor, noop } from '@statsify/util';
import { Prop } from '@typegoose/typegoose';
import type { BasePropOptions } from '@typegoose/typegoose/lib/types';

type Ref = () => Constructor;
type Type = Ref | (() => Constructor[]);
export type Getter<T> = (target: T) => any;
type LeaderboardSort = 'ASC' | 'DESC';

export interface FieldOptions {
  hide?: boolean;
  name?: string;
  enum?: any[];
  enumName?: string;
  type?: Type;
  required?: boolean;
  unique?: boolean;
  index?: boolean;
  sparse?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  ref?: Ref;
  description?: string;
  example?: string | number;
  default?: any;
  leaderboard?: boolean;

  aliases?: string[];

  sort?: LeaderboardSort;

  getter?: Getter<any>;
  store?: boolean;
}

export interface FieldMetadata {
  name: string;
  default: any;
  aliases: string[];
  sort: LeaderboardSort;
  isLeaderboard: boolean;
  type: any;
  getter?: Getter<any>;
  store: boolean;
}

export function Field(type: Type): PropertyDecorator;
export function Field(options: FieldOptions): PropertyDecorator;
export function Field(): PropertyDecorator;
export function Field(options?: Type | FieldOptions): PropertyDecorator {
  let prop: PropertyDecorator;
  let api: PropertyDecorator;

  let defaultValue: any;
  let sort: LeaderboardSort = 'DESC';
  let isLeaderboard = true;
  let name: string;
  let getter: Getter<any>;
  let store = true;

  if (typeof options === 'function') {
    prop = Prop({ type: options });
    api = ApiProperty({ type: options() });
  } else if (typeof options === 'object') {
    const opts: BasePropOptions = {};

    if (options.type) {
      opts.type = options.type;
    }

    if (options.required) {
      opts.required = options.required;
    }

    if (options.unique) {
      opts.unique = options.unique;
    }

    if (options.index) {
      opts.index = options.index;
    }

    if (options.sparse) {
      opts.sparse = options.sparse;
    }

    if (options.enum) {
      opts.enum = options.enum;
    }

    if (options.uppercase) {
      opts.uppercase = true;
    }

    if (options.lowercase) {
      opts.lowercase = true;
    }

    if (options.ref) {
      opts.ref = options.ref;
    }

    defaultValue = options.default;
    sort = options.sort ?? 'DESC';
    isLeaderboard = options.leaderboard ?? true;
    name = options.name ?? '';

    if (options.getter) {
      getter = options.getter;
      isLeaderboard = false;
      prop = noop;
    } else if (options?.store === false) {
      prop = noop;
      store = false;
      isLeaderboard = false;
    } else {
      prop = Prop(opts);
    }

    api = options.hide
      ? ApiHideProperty()
      : ApiProperty({
          enum: options.enum,
          enumName: options.enumName,
          type: options?.type?.(),
          required: options.required,
          name: options.name,
          description: options.description,
          example: options.example,
          default: options.default,
        });
  } else {
    prop = Prop();
    api = ApiProperty();
  }

  return (target, propertyKey) => {
    const type = Reflect.getMetadata('design:type', target, propertyKey);

    const isNumber = type === Number;
    const isBoolean = type === Boolean;
    const isString = type === String;

    isLeaderboard = isLeaderboard && isNumber;

    const fallback = defaultValue
      ? defaultValue
      : isNumber
      ? 0
      : isBoolean
      ? false
      : isString
      ? ''
      : undefined;

    const metadata: FieldMetadata = {
      default: fallback,
      sort,
      isLeaderboard,
      name: name || (propertyKey as string),
      aliases: [],
      type,
      getter,
      store,
    };

    Reflect.defineMetadata('statsify:field', metadata, target, propertyKey);

    prop(target, propertyKey);
    api(target, propertyKey);
  };
}
