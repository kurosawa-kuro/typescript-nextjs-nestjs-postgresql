import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface MicroPost {
  id: number;
  userId: number;
  title: string;
  imagePath: string | null;
  userName: string;
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
  ): Promise<MicroPost> {
    const query = `
      INSERT INTO micropost(user_id, title, image_path) 
      VALUES($1, $2, $3) 
      RETURNING id, user_id as "userId", title, image_path as "imagePath",
        (SELECT name FROM "user" WHERE id = $1) as "userName"
    `;
    const result = await this.databaseService.executeQuery(query, [
      userId,
      title,
      imagePath,
    ]);
    return result.rows[0];
  }

  async list(): Promise<MicroPost[]> {
    const query = `
    SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath", u.name as "userName"
    FROM micropost m
    JOIN "user" u ON m.user_id = u.id
    ORDER BY m.id DESC
  `;
    const result = await this.databaseService.executeQuery(query);
    return result.rows;
  }

  async getCategoriesForMicropost(id: number): Promise<Category[]> {
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