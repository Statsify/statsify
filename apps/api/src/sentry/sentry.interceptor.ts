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
import { Observable, catchError, tap } from "rxjs";
import { URL } from "node:url";
import type { FastifyRequest } from "fastify";

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const url = new URL(`https://statsify.net${req.url}`);

    Sentry.setContext("request", {
      url: url.pathname,
      method: req.method,
      params: req.params as Record<string, unknown>,
      headers: req.headers,
    });

    let transaction: ReturnType<Sentry.Hub["startTransaction"]> | undefined;

    if (!url.pathname.includes("/skin")) {
      transaction = Sentry.startTransaction({
        op: "request",
        name: `${req.method} ${url.pathname}`,
      });

      Sentry.configureScope((scope) => scope.setSpan(transaction));
    }

    return next.handle().pipe(
      catchError((err) => {
        const isHttpException = err instanceof HttpException;
        const isInternalError = err instanceof InternalServerErrorException;

        if (isHttpException && !isInternalError) {
          transaction?.finish();
          throw err;
        }

        Sentry.captureException(err);
        transaction?.setHttpStatus(500);
        transaction?.finish();

        throw err;
      }),
      tap(() => transaction?.finish())
    );
  }
}
