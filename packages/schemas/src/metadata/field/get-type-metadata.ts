import { primitiveConstructors } from '../constants';
import { TypeOptions } from '../field.options';
import { TypeMetadata } from '../metadata.interface';

export const getTypeMetadata = (
  typeOptions: TypeOptions | undefined,
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: Object,
  propertyKey: string | symbol
): TypeMetadata => {
  if (typeOptions) {
    const type = typeOptions();

    if (Array.isArray(type))
      return {
        type: type[0],
        array: true,
        primitive: primitiveConstructors.includes(type[0]),
      };

    return {
      type,
      array: false,
      primitive: primitiveConstructors.includes(type),
    };
  }

  const type = Reflect.getMetadata('design:type', target, propertyKey);

  return {
    type,
    array: false,
    primitive: primitiveConstructors.includes(type),
  };
};
