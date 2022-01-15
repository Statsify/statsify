import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@typegoose/typegoose';

type Constructor<T> = new (...args: any[]) => T;
type Type = () => Constructor<any>;

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
    prop = Prop({
      enum: options.enum,
      type: options.type,
      required: options.required,
      unique: options.unique,
      index: options.index,
      sparse: options.sparse,
      lowercase: options.lowercase,
      uppercase: options.uppercase,
      ref: options.ref,
    });

    api = ApiProperty({
      enum: options.enum,
      enumName: options.enumName,
      type: options.type(),
      required: options.required,
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
