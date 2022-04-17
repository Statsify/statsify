import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { AuthRole } from './auth.role';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (process.env.IGNORE_AUTH) {
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

    return this.authService.limited(apiKey, weight, role);
  }
}
