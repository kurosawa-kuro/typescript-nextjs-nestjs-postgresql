import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
  ) {}

  async createCategory(title: string): Promise<void> {
    const query = 'INSERT INTO category(title) VALUES($1)';
    await this.pool.query(query, [title]);
  }

  async getCategories(): Promise<any[]> {
    const query = 'SELECT * FROM category';
    const result = await this.pool.query(query);
    return result.rows;
  }
}
