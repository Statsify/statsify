/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { URL } from "node:url";
import type { FastifyRequest } from "fastify";

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const url = new URL(`https://statsify.net${request.url}`);

    Sentry.setContext("request", {
      url: url.pathname,
      method: request.method,
      params: request.params as Record<string, unknown>,
      headers: request.headers,
    });

    return Sentry.startSpan({
      op: "request",
      name: `${request.method} ${url.pathname}`,
    }, (span) => {
      try {
        return next.handle();
      } catch (error) {
        const isHttpException = error instanceof HttpException;
        const isInternalError = error instanceof InternalServerErrorException;

        // Filter out exceptions thrown by controllers and services and only report internal server errors to Sentry
        if (isHttpException && !isInternalError) {
          throw error;
        }

        Sentry.captureException(error);
        Sentry.setHttpStatus(span, 500);

        throw error;
      }});
  }
}
