import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthGuard, AuthService],
  exports: [AuthGuard],
})
export class AuthModule {}
