import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class Skin {
  @Field({ index: true, required: true, unique: true })
  public uuid: string;

  @Field()
  public username: string;

  @Field()
  public skinUrl: string;

  @Field({ required: false })
  public slim?: boolean;

  @Field()
  public expiresAt: number;

  public constructor(data: APIData) {
    this.uuid = data.id;
    this.username = data.name;

    const property = data.properties.find((prop: any) => prop.name === 'textures');
    const { textures } = JSON.parse(Buffer.from(property.value, 'base64').toString());

    this.skinUrl = textures.SKIN.url;
    this.slim = textures.SKIN.metadata?.model === 'slim';
  }
}
