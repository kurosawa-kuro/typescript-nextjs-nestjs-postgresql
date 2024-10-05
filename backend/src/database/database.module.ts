// src/database/database.module.ts

import { Module } from '@nestjs/common';
import { DatabaseConfig } from '../config/database.config';
import { DatabaseService } from './database.service';

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => DatabaseConfig.getPool(),
    },
    DatabaseService,
  ],
  exports: ['DATABASE_POOL', DatabaseService],
})
export class DatabaseModule {}
