// backend\src\database\database.service.ts

import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async executeQuery(query: string, values: any[] = []): Promise<QueryResult> {
    try {
      return await this.pool.query(query, values);
    } catch (error) {
      this.logger.error(`Database query failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}