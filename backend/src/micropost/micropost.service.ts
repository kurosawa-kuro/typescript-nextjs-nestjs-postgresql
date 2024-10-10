import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(MicroPostService.name);

  constructor(private databaseService: DatabaseService) {}

  async create(
    userId: number,
    title: string,
    imagePath: string | null,
    categoryIds: number[],
  ): Promise<MicroPost> {
    this.logger.log(`Creating micropost: userId=${userId}, title=${title}, imagePath=${imagePath}, categoryIds=${categoryIds}`);
    try {
      await this.databaseService.executeQuery('BEGIN');
      this.logger.debug('Transaction begun');

      const insertMicropostQuery = `
        INSERT INTO micropost(user_id, title, image_path) 
        VALUES($1, $2, $3) 
        RETURNING id, user_id as "userId", title, image_path as "imagePath",
          (SELECT name FROM "user" WHERE id = $1) as "userName"
      `;
      const micropostResult = await this.databaseService.executeQuery(insertMicropostQuery, [userId, title, imagePath]);
      const micropost = micropostResult.rows[0];
      this.logger.debug(`Micropost created: ${JSON.stringify(micropost)}`);

      if (categoryIds && categoryIds.length > 0) {
        const insertCategoryQuery = `
          INSERT INTO micropost_category(micropost_id, category_id)
          SELECT $1, unnest($2::int[])
        `;
        await this.databaseService.executeQuery(insertCategoryQuery, [micropost.id, categoryIds]);
        this.logger.debug(`Categories associated: micropostId=${micropost.id}, categoryIds=${categoryIds}`);
      }

      await this.databaseService.executeQuery('COMMIT');
      this.logger.debug('Transaction committed');
      this.logger.log(`Micropost created successfully: ${JSON.stringify(micropost)}`);
      return micropost;
    } catch (error) {
      this.logger.error(`Error creating micropost: ${error.message}`, error.stack);
      await this.databaseService.executeQuery('ROLLBACK');
      this.logger.debug('Transaction rolled back');
      throw error;
    }
  }

  async list(): Promise<MicroPost[]> {
    this.logger.log('Fetching all microposts');
    try {
      const query = `
      SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath", u.name as "userName"
      FROM micropost m
      JOIN "user" u ON m.user_id = u.id
      ORDER BY m.id DESC
    `;
      const result = await this.databaseService.executeQuery(query);
      this.logger.debug(`Fetched ${result.rows.length} microposts`);
      return result.rows;
    } catch (error) {
      this.logger.error(`Error fetching microposts: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCategoriesForMicropost(id: number): Promise<Category[] | null> {
    this.logger.log(`Fetching categories for micropost with id: ${id}`);
    try {
      const query = `
        SELECT c.id, c.title
        FROM category c
        JOIN micropost_category mc ON c.id = mc.category_id
        WHERE mc.micropost_id = $1
      `;
      const result = await this.databaseService.executeQuery(query, [id]);
      if (result.rows.length === 0) {
        this.logger.debug(`No categories found for micropost with id: ${id}`);
        return null;
      }
      this.logger.debug(`Fetched ${result.rows.length} categories for micropost with id: ${id}`);
      return result.rows;
    } catch (error) {
      this.logger.error(`Error fetching categories for micropost with id ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}