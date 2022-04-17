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
      'x-Ratelimit-Used': keyInfo.used,
      'x-Ratelimit-Total': keyInfo.limit,
      'x-Ratelimit-Timeout': keyInfo.resetTime,
    });

    return keyInfo.canActivate;
  }
}
