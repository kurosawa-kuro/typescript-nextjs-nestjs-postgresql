// src/micropost/micropost.service.ts

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface MicroPost {
  id: number;
  userId: number;
  title: string;
  imagePath: string | null;
  userName: string;
  userAvatarPath: string | null;
  categories: Category[];
}

export interface Category {
  id: number;
  title: string;
}

@Injectable()
export class MicroPostService {
  constructor(private databaseService: DatabaseService) {}

  async create(
    userId: number,
    title: string,
    imagePath: string | null,
    categoryIds: number[],
  ): Promise<MicroPost> {
    try {
      await this.databaseService.executeQuery('BEGIN');

      const cleanedImagePath = imagePath ? imagePath.replace(/^uploads[\/\\]/, '') : null;

      const insertMicropostQuery = `
        INSERT INTO micropost(user_id, title, image_path) 
        VALUES($1, $2, $3) 
        RETURNING id, user_id as "userId", title, image_path as "imagePath",
          (SELECT name FROM "user" WHERE id = $1) as "userName",
          (SELECT avatar_path FROM "user" WHERE id = $1) as "userAvatarPath"
      `;
      const micropostResult = await this.databaseService.executeQuery(insertMicropostQuery, [userId, title, cleanedImagePath]);
      const micropost = micropostResult.rows[0];

      if (categoryIds && categoryIds.length > 0) {
        const insertCategoryQuery = `
          INSERT INTO micropost_category(micropost_id, category_id)
          SELECT $1, unnest($2::int[])
        `;
        await this.databaseService.executeQuery(insertCategoryQuery, [micropost.id, categoryIds]);
      }

      await this.databaseService.executeQuery('COMMIT');
      return micropost;
    } catch (error) {
      await this.databaseService.executeQuery('ROLLBACK');
      throw error;
    }
  }

  async list(): Promise<MicroPost[]> {
    const query = `
      SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath", 
             u.name as "userName", u.avatar_path as "userAvatarPath",
             COALESCE(json_agg(json_build_object('id', c.id, 'title', c.title)) 
                      FILTER (WHERE c.id IS NOT NULL), '[]') as categories
      FROM micropost m
      JOIN "user" u ON m.user_id = u.id
      LEFT JOIN micropost_category mc ON m.id = mc.micropost_id
      LEFT JOIN category c ON mc.category_id = c.id
      GROUP BY m.id, u.name, u.avatar_path
      ORDER BY m.id DESC
    `;
    const result = await this.databaseService.executeQuery(query);

    // Add 'uploads/' prefix to imagePath
    return result.rows.map(micropost => {

      return micropost;
    });
  }

  async findById(id: number): Promise<MicroPost | null> {
    const query = `
      SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath",
             u.name as "userName", u.avatar_path as "userAvatarPath",
             COALESCE(json_agg(json_build_object('id', c.id, 'title', c.title)) 
                      FILTER (WHERE c.id IS NOT NULL), '[]') as categories
      FROM micropost m
      JOIN "user" u ON m.user_id = u.id
      LEFT JOIN micropost_category mc ON m.id = mc.micropost_id
      LEFT JOIN category c ON mc.category_id = c.id
      WHERE m.id = $1
      GROUP BY m.id, u.name, u.avatar_path
    `;
    const result = await this.databaseService.executeQuery(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    const micropost = result.rows[0];

    return micropost;
  }

  async getCategoriesForMicropost(id: number): Promise<Category[] | null> {
    const query = `
      SELECT c.id, c.title
      FROM category c
      JOIN micropost_category mc ON c.id = mc.category_id
      WHERE mc.micropost_id = $1
    `;
    const result = await this.databaseService.executeQuery(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows;
  }
}