// src/database/database.module.ts

import { Module } from '@nestjs/common';
import { DatabaseConfig } from '../config/database.config';

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => DatabaseConfig.getPool(),
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}