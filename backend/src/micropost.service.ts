// micropost.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

export interface MicroPost {
  id: number;
  userId: number;
  title: string;
}

@Injectable()
export class MicroPostService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
  ) {}

  async createMicroPost(userId: number, title: string): Promise<MicroPost> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const query = 'INSERT INTO micropost(user_id, title) VALUES($1, $2) RETURNING id, user_id as "userId", title';
      const result = await client.query(query, [userId, title]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMicroPosts(): Promise<MicroPost[]> {
    const query = 'SELECT id, user_id as "userId", title FROM micropost';
    const result = await this.pool.query(query);
    return result.rows;
  }
}