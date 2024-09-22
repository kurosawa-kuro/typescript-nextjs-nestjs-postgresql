import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MicropostCategoryService } from '../micropost-category/micropost-category.service';
import { MicropostCategoryModule } from '../micropost-category/micropost-category.module';
import { DatabaseModule } from '../database/database.module'; // Add this import

@Module({
  imports: [MicropostCategoryModule, DatabaseModule], // Add DatabaseModule here
  controllers: [CategoryController],
  providers: [CategoryService, MicropostCategoryService],
})
export class CategoryModule {}
