// src/user/user.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar_path: string;
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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private databaseService: DatabaseService) {}

  async create(userCreationData: UserCreationData): Promise<User> {
    const query = `
      INSERT INTO "user" (name, email, password_hash, is_admin)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, is_admin AS "isAdmin"
    `;
    const values = [
      userCreationData.name,
      userCreationData.email,
      userCreationData.passwordHash,
      userCreationData.isAdmin,
    ];

    const result = await this.databaseService.executeQuery(query, values);
    return result.rows[0];
  }

  async find(id: number): Promise<User | null> {
    const query =
      'SELECT id, name, email, is_admin AS "isAdmin" FROM "user" WHERE id = $1';
    const result = await this.databaseService.executeQuery(query, [id]);
    return result.rows[0] || null;
  }

  async index(): Promise<User[]> {
    const query = 'SELECT id, name, email, is_admin AS "isAdmin" FROM "user"';
    const result = await this.databaseService.executeQuery(query);
    return result.rows;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const query =
      'SELECT id, name, email, password_hash, is_admin AS "isAdmin" FROM "user" WHERE email = $1';
    const result = await this.databaseService.executeQuery(query, [email]);
    return result.rows[0] || null;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
