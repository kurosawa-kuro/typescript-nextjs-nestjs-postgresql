import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface UserCreationData {
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async create(
    name: string,
    email: string,
    password: string,
    isAdmin: boolean = false,
  ): Promise<User> {
    const passwordHash = await this.hashPassword(password);
    const userData: UserCreationData = { name, email, passwordHash, isAdmin };
    return this.createUserInDatabase(userData);
  }

  async find(id: number): Promise<User | null> {
    const query = 'SELECT id, name, email, is_admin as "isAdmin" FROM "user" WHERE id = $1';
    return this.executeQuery(query, [id]).then(result => result.rows[0] || null);
  }

  async index(): Promise<User[]> {
    const query = 'SELECT id, name, email, is_admin as "isAdmin" FROM "user"';
    return this.executeQuery(query).then(result => result.rows);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async createUserInDatabase(userData: UserCreationData): Promise<User> {
    const query =
      'INSERT INTO "user"(name, email, password_hash, is_admin) VALUES($1, $2, $3, $4) RETURNING id, name, email, is_admin as "isAdmin"';
    const values = [userData.name, userData.email, userData.passwordHash, userData.isAdmin];
    return this.executeQuery(query, values).then(result => result.rows[0]);
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
}