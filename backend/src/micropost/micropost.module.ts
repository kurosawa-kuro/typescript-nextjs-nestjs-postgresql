// src/micropost/micropost.module.ts

import { Module } from '@nestjs/common';
import { MicroPostService } from './micropost.service';
import { MicroPostController } from './micropost.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MicroPostService],
  controllers: [MicroPostController],
  exports: [MicroPostService],
})
export class MicropostModule {}