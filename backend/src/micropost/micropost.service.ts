import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface MicroPost {
  id: number;
  userId: number;
  title: string;
  imagePath: string | null;
  userName: string;
  userAvatarPath: string | null;
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

      // Remove 'uploads\' or 'uploads/' from the imagePath
      const cleanedImagePath = imagePath ? imagePath.replace(/^uploads[\/\\]/, '') : null;
      console.log('cleanedImagePath', cleanedImagePath);

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
    try {
      const query = `
      SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath", 
             u.name as "userName", u.avatar_path as "userAvatarPath"
      FROM micropost m
      JOIN "user" u ON m.user_id = u.id
      ORDER BY m.id DESC
    `;
      const result = await this.databaseService.executeQuery(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getCategoriesForMicropost(id: number): Promise<Category[] | null> {
    try {
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
    } catch (error) {
      throw error;
    }
  }
}