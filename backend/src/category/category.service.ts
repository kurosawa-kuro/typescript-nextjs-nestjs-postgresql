import { Injectable } from '@nestjs/common';
import { DatabaseService  } from '../database/database.service';

export interface Category {
  id: number;
  title: string;
}

@Injectable()
export class CategoryService {
  constructor(private databaseService: DatabaseService) {}

  async create(title: string): Promise<Category> {
    const query = 'INSERT INTO category(title) VALUES($1) RETURNING id, title';
    return this.databaseService.executeQuery(query, [title]).then(result => result.rows[0]);
  }

  async list(): Promise<Category[]> {
    const query = 'SELECT * FROM category';
  return this.databaseService.executeQuery(query).then(result => result.rows);
  }
}