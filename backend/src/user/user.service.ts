import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
  ) {}

  async create(name: string, email: string, password: string, isAdmin: boolean = false): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO "user"(name, email, password_hash, is_admin) VALUES($1, $2, $3, $4) RETURNING id, name, email, is_admin as "isAdmin"';
    const result = await this.pool.query(query, [name, email, hashedPassword, isAdmin]);
    return result.rows[0];
  }

  async find(id: number): Promise<User | null> {
    const query = 'SELECT id, name, email, is_admin as "isAdmin" FROM "user" WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async index(): Promise<User[]> {
    this.logger.debug('index method called in UserService');
    const query = 'SELECT id, name, email, is_admin as "isAdmin" FROM "user"';
    const result = await this.pool.query(query);
    this.logger.debug(`Retrieved ${result.rows.length} users from database`);
    return result.rows;
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    const query = 'SELECT id, name, email, password_hash, is_admin as "isAdmin" FROM "user" WHERE email = $1';
    const result = await this.pool.query(query, [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { password_hash, ...secureUser } = user;
      return secureUser;
    }
    return null;
  }
}