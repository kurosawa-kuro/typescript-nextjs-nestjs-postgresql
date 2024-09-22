import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface UserCreationData {
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
}

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}

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
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async createUser(userData: UserCreationData): Promise<User> {
    const query =
      'INSERT INTO "user"(name, email, password_hash, is_admin) VALUES($1, $2, $3, $4) RETURNING id, name, email, is_admin as "isAdmin"';
    const values = [userData.name, userData.email, userData.passwordHash, userData.isAdmin];
    return this.executeQuery(query, values).then(result => result.rows[0]);
  }

  async findUser(id: number): Promise<User | null> {
    const query = 'SELECT id, name, email, is_admin as "isAdmin" FROM "user" WHERE id = $1';
    return this.executeQuery(query, [id]).then(result => result.rows[0] || null);
  }

  async indexUsers(): Promise<User[]> {
    const query = 'SELECT id, name, email, is_admin as "isAdmin" FROM "user"';
    return this.executeQuery(query).then(result => result.rows);
  }

  async createMicroPost(userId: number, title: string, imagePath: string | null): Promise<MicroPost> {
    const query = `
      INSERT INTO micropost(user_id, title, image_path) 
      VALUES($1, $2, $3) 
      RETURNING id, user_id as "userId", title, image_path as "imagePath",
        (SELECT name FROM "user" WHERE id = $1) as "userName"
    `;
    return this.executeQuery(query, [userId, title, imagePath]).then(result => result.rows[0]);
  }

  async indexMicroPosts(): Promise<MicroPost[]> {
    const query = `
      SELECT m.id, m.user_id as "userId", m.title, m.image_path as "imagePath", u.name as "userName"
      FROM micropost m
      JOIN "user" u ON m.user_id = u.id
    `;
    return this.executeQuery(query).then(result => result.rows);
  }

  async createCategory(title: string): Promise<Category> {
    const query = 'INSERT INTO category(title) VALUES($1) RETURNING id, title';
    return this.executeQuery(query, [title]).then(result => result.rows[0]);
  }  

  async indexCategories(): Promise<Category[]> {
    const query = 'SELECT * FROM category';
    return this.executeQuery(query).then(result => result.rows);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT id, name, email, password_hash, is_admin as "isAdmin" FROM "user" WHERE email = $1';
    return this.executeQuery(query, [email]).then(result => result.rows[0] || null);
  }

  private async executeQuery(query: string, values: any[] = []): Promise<QueryResult> {
    try {
      return values.length > 0
        ? await this.pool.query(query, values)
        : await this.pool.query(query);
    } catch (error) {
      this.logger.error(`Database query failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clearAllTables(): Promise<void> {
    await this.executeQuery('DELETE FROM "micropost_category"');
    await this.executeQuery('DELETE FROM "category"');
    await this.executeQuery('DELETE FROM "micropost"');
    await this.executeQuery('DELETE FROM "user"');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}