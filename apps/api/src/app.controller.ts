/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { Controller, Get, Header, Render } from "@nestjs/common";

@Controller("/")
export class AppController {
  @Get()
  @Render("redoc.handlebars")
  @Header(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; child-src * 'unsafe-inline' 'unsafe-eval' blob:; worker-src * 'unsafe-inline' 'unsafe-eval' blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
  )
  @ApiExcludeEndpoint()
  /**
   * Redoc docs
   */
  public get() {
    return {
      data: {
        docUrl: "/swagger-json",
        favicon: "/public/icon.svg",
        options: JSON.stringify({
          disableSearch: true,
          hideDownloadButton: false,
          hideHostname: false,
          jsonSampleExpandLevel: 2,
          maxDisplayedEnumValues: 35,
          noAutoAuth: true,
          pathInMiddlePanel: true,
          sortPropsAlphabetically: true,
          theme: {
            codeBlock: {
              borderRadius: "10px",
            },
            codeSample: {
              backgroundColor: "rgba(28, 27, 41, 1)",
            },
            colors: {
              border: {
                dark: "rgba(0, 0, 0, 0.1)",
              },
              error: {
                contrastText: "#000",
                dark: "#760e2d",
                light: "#f7bfd0",
                main: "rgba(231, 54, 107, 1)",
              },
              http: {
                basic: "rgba(185, 187, 190, 1)",
                delete: "rgba(231, 54, 107, 1)",
                get: "rgba(67, 181, 129, 1)",
                head: "rgba(255, 168, 210, 1)",
                link: "rgba(190, 211, 255, 1)",
                options: "rgba(220, 221, 222, 1)",
                patch: "rgba(237, 152, 141, 1)",
                post: "rgba(77, 122, 232, 1)",
                put: "rgba(224, 95, 163, 1)",
              },
              primary: {
                contrastText: "#000",
                dark: "#b3b3b3",
                light: "#b3b3b3",
                main: "#b3b3b3",
              },
              responses: {
                error: {
                  backgroundColor: "rgba(231,54,107,0.15)",
                  color: "rgba(231, 54, 107, 1)",
                },
                info: {
                  backgroundColor: "rgba(140,217,255,0.15)",
                  color: "rgba(140, 217, 255, 1)",
                },
                redirect: {
                  backgroundColor: "rgba(255,184,105,0.15)",
                  color: "rgba(255, 184, 105, 1)",
                },
                success: {
                  backgroundColor: "rgba(67,181,129,0.15)",
                  color: "rgba(67, 181, 129, 1)",
                },
              },
              secondary: {
                contrastText: "#000",
                light: "#b3b3b3",
                main: "#b3b3b3",
              },
              success: {
                contrastText: "#000",
                dark: "#1a4531",
                light: "#afe2cb",
                main: "rgba(67, 181, 129, 1)",
              },
              text: {
                primary: "rgba(185, 187, 190, 1)",
                secondary: "#fff",
                light: "#fff",
              },
              warning: {
                contrastText: "#000",
                dark: "#cf6d00",
                light: "#fff",
                main: "rgba(255, 184, 105, 1)",
              },
            },
            sidebar: {
              arrow: {
                color: "rgba(185, 187, 190, 1)",
              },
              backgroundColor: "rgba(41, 40, 65, 1)",
              textColor: "rgba(255, 255, 255, 1)",
            },
            rightPanel: {
              backgroundColor: "rgba(41, 40, 65, 1)",
            },
            schema: {
              caretColor: "rgba(231, 54, 107, 1)",
              linesColor: "rgba(164, 164, 198, 0)",
              requireLabelColor: "rgba(231, 54, 107, 1)",
              typeNameColor: "rgba(219, 231, 255, 1)",
              typeTitleColor: "rgba(77, 122, 232, 1)",
            },
            typography: {
              code: {
                color: "rgba(77, 122, 232, 1)",
              },
              fontFamily: "Lexend Deca",
              links: {
                color: "rgba(0, 175, 244, 1)",
                hover: "#5bd1ff",
                visited: "rgba(0, 175, 244, 1)",
              },
            },
          },
        }),
      },
    };
  }
}
