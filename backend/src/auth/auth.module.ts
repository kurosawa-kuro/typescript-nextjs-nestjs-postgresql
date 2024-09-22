import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    UserModule, // Import UserModule to use UserService
    DatabaseModule, // Import DatabaseModule for database connection
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], // Optionally export AuthService if it's going to be used elsewhere
})
export class AuthModule {}
