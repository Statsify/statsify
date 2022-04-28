import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { User, VerifyCode } from '@statsify/schemas';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypegooseModule.forFeature([User, VerifyCode])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
