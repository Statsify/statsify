import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthRole } from './auth.role';

export interface AuthDecoratorOptions {
  /**
   * @description The required weight for the request, for example if the route adds more than a single api request limit
   */
  weight?: number;

  /**
   * @description The required roles for the request
   */
  role?: AuthRole;
}

export function Auth({ weight = 1, role = AuthRole.MEMBER }: AuthDecoratorOptions = {}) {
  return applyDecorators(
    SetMetadata('auth-weight', weight),
    SetMetadata('auth-role', role),
    UseGuards(AuthGuard)
  );
}
