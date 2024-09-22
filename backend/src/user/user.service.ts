// backend/src/user/user.service.ts

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
  password(password: any): unknown;
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

  async create(userData: UserCreationData): Promise<User> {
    const query = `
      INSERT INTO "user"(name, email, password_hash, is_admin)
      VALUES($1, $2, $3, $4) RETURNING id, name, email, is_admin as "isAdmin"
    `;
    const values = [userData.name, userData.email, userData.passwordHash, userData.isAdmin];
    return this.databaseService.executeQuery(query, values).then(rows => rows[0]); 
  }

  async find(id: number): Promise<User | null> {
    const query = 'SELECT id, name, email, is_admin as "isAdmin" FROM "user" WHERE id = $1';
    return this.databaseService.executeQuery(query, [id]).then(rows => rows[0] || null);
  }

  async index(): Promise<User[]> {
    const query = 'SELECT id, name, email, is_admin as "isAdmin" FROM "user"';
    return this.databaseService.executeQuery(query).then(result => result.rows);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT id, name, email, password_hash, is_admin as "isAdmin" FROM "user" WHERE email = $1';
    return this.databaseService.executeQuery(query, [email]).then(rows => rows[0] || null);
  }
}
