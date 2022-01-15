import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/')
export class AppController {
  public constructor(private appService: AppService) {}

  @Get()
  public get() {
    return this.appService.get();
  }
}
