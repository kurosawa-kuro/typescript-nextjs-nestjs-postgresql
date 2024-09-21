// nestjs-pg\src\micropost-category.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class MicropostCategoryService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
  ) {}

  async getMicropostCategories(micropostId: number): Promise<any[]> {
    const query = `
      SELECT c.id, c.title 
      FROM category c
      JOIN micropost_category mc ON c.id = mc.category_id
      WHERE mc.micropost_id = $1
    `;
    const result = await this.pool.query(query, [micropostId]);
    return result.rows;
  }

  async getCategoryMicroposts(categoryId: number): Promise<any[]> {
    const query = `
      SELECT m.id, m.title, u.id as user_id, u.name as user_name
      FROM micropost m
      JOIN micropost_category mc ON m.id = mc.micropost_id
      JOIN "user" u ON m.user_id = u.id
      WHERE mc.category_id = $1
    `;
    const result = await this.pool.query(query, [categoryId]);
    return result.rows;
  }

  async addCategoryToMicropost(micropostId: number, categoryId: number): Promise<void> {
    const query = 'INSERT INTO micropost_category(micropost_id, category_id) VALUES($1, $2)';
    await this.pool.query(query, [micropostId, categoryId]);
  }
}