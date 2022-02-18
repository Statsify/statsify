import { Player } from '@statsify/schemas';
import { modelOptions as ModelOptions } from '@typegoose/typegoose';

@ModelOptions({ schemaOptions: { collection: 'weekly' } })
export class Weekly extends Player {}
