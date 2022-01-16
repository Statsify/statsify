import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import type { Constructor } from '@statsify/util';
import { Prop } from '@typegoose/typegoose';
import type { BasePropOptions } from '@typegoose/typegoose/lib/types';

type Type = () => Constructor;

export interface FieldOptions {
  hide?: boolean;
  name?: string;
  enum?: any[] | Record<string, any>;
  enumName?: string;
  type?: Type;
  required?: boolean;
  unique?: boolean;
  index?: boolean;
  sparse?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  ref?: Type;
  description?: string;
  example?: string;
  default?: any;
  leaderboard?: boolean;

  aliases?: string[];
}

export function Field(type: Type): PropertyDecorator;
export function Field(options: FieldOptions): PropertyDecorator;
export function Field(): PropertyDecorator;
export function Field(options?: Type | FieldOptions): PropertyDecorator {
  let prop: PropertyDecorator;
  let api: PropertyDecorator;

  if (typeof options === 'function') {
    prop = Prop({ type: options });
    api = ApiProperty({ type: options() });
  } else if (typeof options === 'object') {
    const opts: BasePropOptions = {
      type: options.type,
      required: options.required,
      unique: options.unique,
      index: options.index,
      sparse: options.sparse,
    };

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

    prop = Prop(opts);

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
    prop(target, propertyKey);
    api(target, propertyKey);
  };
}
