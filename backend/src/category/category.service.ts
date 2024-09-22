import { Injectable } from '@nestjs/common';
import { DatabaseService, Category } from '../database/database.service';

@Injectable()
export class CategoryService {
  constructor(private databaseService: DatabaseService) {}

  async create(title: string): Promise<Category> {
    return this.databaseService.createCategory(title);
  }

  async list(): Promise<Category[]> {
    return this.databaseService.listCategories();
  }
}