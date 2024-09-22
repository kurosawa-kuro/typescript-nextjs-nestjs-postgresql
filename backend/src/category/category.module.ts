import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MicropostCategoryService } from '../micropost-category/micropost-category.service';
import { MicropostCategoryModule } from '../micropost-category/micropost-category.module';

@Module({
  imports: [MicropostCategoryModule],
  controllers: [CategoryController],
  providers: [CategoryService, MicropostCategoryService],
})
export class CategoryModule {}