// src/category.module.ts
import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
// import { DatabaseModule } from '../database.module';
import { MicropostCategoryService } from '../micropost-category/micropost-category.service';

@Module({
  providers: [CategoryService, MicropostCategoryService],
  controllers: [CategoryController],
  exports: [CategoryService, MicropostCategoryService],
})
export class CategoryModule {}