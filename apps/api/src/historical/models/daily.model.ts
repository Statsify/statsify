import { Player } from '@statsify/schemas';
import { modelOptions as ModelOptions } from '@typegoose/typegoose';

@ModelOptions({ schemaOptions: { collection: 'daily' } })
export class Daily extends Player {}
