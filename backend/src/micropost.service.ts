import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

export interface MicroPost {
  id: number;
  userId: number;
  title: string;
  userName: string;  // 新しく追加
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
      const query = `
        INSERT INTO micropost(user_id, title) 
        VALUES($1, $2) 
        RETURNING id, user_id as "userId", title, 
          (SELECT name FROM "user" WHERE id = $1) as "userName"
      `;
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
    const query = `
      SELECT m.id, m.user_id as "userId", m.title, u.name as "userName"
      FROM micropost m
      JOIN "user" u ON m.user_id = u.id
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }
}