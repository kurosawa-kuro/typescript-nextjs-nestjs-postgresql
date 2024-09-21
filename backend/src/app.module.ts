import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { UserService } from './user.service';
import { MicroPostService } from './micropost.service';
import { CategoryService } from './category.service';
import { MicropostCategoryService } from './micropost-category.service';  // 追加
import { UserController } from './user.controller';
import { MicroPostController } from './micropost.controller';
import { CategoryController } from './category.controller';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: async () => {
        const pool = new Pool({
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: parseInt(process.env.DB_PORT, 10),
        });
        return pool;
      },
    },
    UserService,
    MicroPostService,
    CategoryService,
    MicropostCategoryService,  // 追加
  ],
  controllers: [
    UserController, 
    MicroPostController,
    CategoryController
  ],
})
export class AppModule {}