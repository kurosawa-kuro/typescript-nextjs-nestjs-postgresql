import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserModule], // Make sure to import UserModule to use UserService
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
