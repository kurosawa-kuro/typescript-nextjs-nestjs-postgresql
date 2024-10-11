import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class MicropostCategoryService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async categories(micropostId: number) {
    const query = `
      SELECT c.id, c.title
      FROM category c
      JOIN micropost_category mc ON c.id = mc.category_id
      WHERE mc.micropost_id = $1
    `;
    const result = await this.pool.query(query, [micropostId]);
    return result.rows;
  }

  async add_category(micropostId: number, categoryId: number) {
    const query = `
      INSERT INTO micropost_category (micropost_id, category_id)
      VALUES ($1, $2)
      ON CONFLICT (micropost_id, category_id) DO NOTHING
    `;
    await this.pool.query(query, [micropostId, categoryId]);
  }

  async microposts(categoryId: number) {
    const query = `
    SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath",
           u.name as "userName", u.avatar_path as "userAvatarPath"
    FROM micropost m
    JOIN micropost_category mc ON m.id = mc.micropost_id
    JOIN "user" u ON m.user_id = u.id
    WHERE mc.category_id = $1
    ORDER BY m.id DESC
  `;
    const result = await this.pool.query(query, [categoryId]);
    return result.rows;
  }
}
