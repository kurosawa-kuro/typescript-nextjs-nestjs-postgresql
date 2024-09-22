// src/micropost.module.ts
import { Module } from '@nestjs/common';
import { MicroPostService } from './micropost.service';
import { MicroPostController } from './micropost.controller';
// import { DatabaseModule } from './database.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [CategoryModule],
  providers: [MicroPostService],
  controllers: [MicroPostController],
})
export class MicropostModule {}