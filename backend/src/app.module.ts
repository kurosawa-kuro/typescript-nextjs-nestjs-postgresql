// src/app.module.ts

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseConfig } from './config/database.config';
import { UserService } from './user.service';
import { MicroPostService } from './micropost.service';
import { CategoryService } from './category.service';
import { MicropostCategoryService } from './micropost-category.service';
import { UserController } from './user.controller';
import { MicroPostController } from './micropost.controller';
import { CategoryController } from './category.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => DatabaseConfig.getPool(),
    },
    UserService,
    MicroPostService,
    CategoryService,
    MicropostCategoryService,
  ],
  controllers: [
    UserController, 
    MicroPostController,
    CategoryController
  ],
})
export class AppModule {}