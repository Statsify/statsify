/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthRole } from './auth.role';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.IGNORE_AUTH?.toLowerCase() === 'true') {
      return true;
    }

    const handler = context.getHandler();

    const weight = this.reflector.get<number>('auth-weight', handler);
    const role = this.reflector.get<AuthRole>('auth-role', handler);

    if (!weight || role == undefined) return true;

    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const apiKey: string =
      (req.headers['x-api-key'] as string) ?? (req.query as Record<string, string>)['key'];

    if (!apiKey) throw new UnauthorizedException();

    const keyInfo = await this.authService.limited(apiKey, weight, role);

    context.switchToHttp().getResponse<FastifyReply>().headers({
      'x-ratelimit-used': keyInfo.used,
      'x-ratelimit-total': keyInfo.limit,
      'x-ratelimit-timeout': keyInfo.resetTime,
    });

    return keyInfo.canActivate;
  }
}
