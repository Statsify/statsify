import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public get() {
    return {
      message: 'Hello World!',
    };
  }
}
