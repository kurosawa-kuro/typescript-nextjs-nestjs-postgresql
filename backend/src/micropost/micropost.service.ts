import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

export interface MicroPost {
  id: number;
  userId: number;
  title: string;
  userName: string;
  imagePath: string | null;
}

@Injectable()
export class MicroPostService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
  ) {}

  async createMicroPost(userId: number, title: string, imagePath: string | null): Promise<MicroPost> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO micropost(user_id, title, image_path) 
        VALUES($1, $2, $3) 
        RETURNING id, user_id as "userId", title, image_path as "imagePath",
          (SELECT name FROM "user" WHERE id = $1) as "userName"
      `;
      const result = await client.query(query, [userId, title, imagePath]);
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
      SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath", u.name as "userName"
      FROM micropost m
      JOIN "user" u ON m.user_id = u.id
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }
}