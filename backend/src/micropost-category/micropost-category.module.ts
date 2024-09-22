// src/micropost-category/micropost-category.module.ts

import { Module } from '@nestjs/common';
import { MicropostCategoryService } from './micropost-category.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MicropostCategoryService],
  exports: [MicropostCategoryService],
})
export class MicropostCategoryModule {}