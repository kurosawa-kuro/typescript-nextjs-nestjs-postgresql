// src/micropost/micropost.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface MicroPost {
  id: number;
  userId: number;
  title: string;
  imagePath: string | null;
  userName: string;
}

@Injectable()
export class MicroPostService {
  constructor(private databaseService: DatabaseService) {}

  async create(userId: number, title: string, imagePath: string | null): Promise<MicroPost> {
    const query = `
      INSERT INTO micropost(user_id, title, image_path) 
      VALUES($1, $2, $3) 
      RETURNING id, user_id as "userId", title, image_path as "imagePath",
        (SELECT name FROM "user" WHERE id = $1) as "userName"
    `;
    const result = await this.databaseService.executeQuery(query, [userId, title, imagePath]);
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
}