import { Player } from '@statsify/schemas';
import { modelOptions as ModelOptions } from '@typegoose/typegoose';

@ModelOptions({ schemaOptions: { collection: 'monthly' } })
export class Monthly extends Player {}
