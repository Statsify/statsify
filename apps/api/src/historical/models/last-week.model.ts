import { Player } from '@statsify/schemas';
import { modelOptions as ModelOptions } from '@typegoose/typegoose';

@ModelOptions({ schemaOptions: { collection: 'lastWeek' } })
export class LastWeek extends Player {}
