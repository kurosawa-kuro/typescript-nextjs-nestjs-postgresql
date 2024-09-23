import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { MicropostModule } from './micropost/micropost.module';
import { CategoryModule } from './category/category.module';
import { MicropostCategoryModule } from './micropost-category/micropost-category.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    UserModule,
    MicropostModule,
    CategoryModule,
    MicropostCategoryModule,
    AuthModule, // Add AuthModule here
  ],
})
export class AppModule {}
