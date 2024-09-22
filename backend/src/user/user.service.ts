// src/user/user.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DatabaseService } from '../database/database.service';

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
      userCreationData.isAdmin
    ];
    
    const result = await this.databaseService.executeQuery(query, values);
    return result.rows[0];
  }

  async find(id: number): Promise<User | null> {
    const query = 'SELECT id, name, email, is_admin AS "isAdmin" FROM "user" WHERE id = $1';
    const result = await this.databaseService.executeQuery(query, [id]);
    return result.rows[0] || null;
  }

  async index(): Promise<User[]> {
    const query = 'SELECT id, name, email, is_admin AS "isAdmin" FROM "user"';
    const result = await this.databaseService.executeQuery(query);
    return result.rows;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT id, name, email, password_hash, is_admin AS "isAdmin" FROM "user" WHERE email = $1';
    const result = await this.databaseService.executeQuery(query, [email]);
    return result.rows[0] || null;
  }

  async hashPassword(password: string): Promise<string> {
    // 実際のハッシュ化ロジックを実装する必要があります
    // 例: bcrypt を使用する場合
    // const salt = await bcrypt.genSalt();
    // return bcrypt.hash(password, salt);
    return 'hashedPassword'; // この行は実際のハッシュ化ロジックに置き換えてください
  }
}