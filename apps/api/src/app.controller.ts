import { Controller, Get, Header, Render } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('/')
export class AppController {
  @Get()
  @Render('redoc.handlebars')
  @Header(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; child-src * 'unsafe-inline' 'unsafe-eval' blob:; worker-src * 'unsafe-inline' 'unsafe-eval' blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
  )
  @ApiExcludeEndpoint()
  public get() {
    return {
      data: {
        docUrl: 'http://localhost:3000/swagger/json',
        favicon: '/public/icon.svg',
        options: JSON.stringify({
          theme: {
            logo: {
              gutter: '15px',
            },
          },
          sortPropsAlphabetically: true,
          hideDownloadButton: false,
          hideHostname: false,
          noAutoAuth: true,
          pathInMiddlePanel: true,
        }),
      },
    };
  }
}
