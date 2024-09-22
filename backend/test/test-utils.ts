import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { MicroPostService } from '../src/micropost/micropost.service';
import { CategoryService } from '../src/category/category.service';
import { Pool } from 'pg';
import { MicropostCategoryService } from '../src/micropost-category/micropost-category.service';

export async function setupTestApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const userService = moduleFixture.get<UserService>(UserService);
  const micropostService = moduleFixture.get<MicroPostService>(MicroPostService);
  const categoryService = moduleFixture.get<CategoryService>(CategoryService);
  const micropostCategoryService = moduleFixture.get<MicropostCategoryService>(MicropostCategoryService);
  const pool = moduleFixture.get('DATABASE_POOL'); // Update to use 'DATABASE_POOL'

  return { app, userService, micropostService, categoryService, micropostCategoryService, pool };
}


export async function clearDatabase(pool: Pool) {
  await pool.query('DELETE FROM "micropost"');
  await pool.query('DELETE FROM "user"');
  await pool.query('DELETE FROM "category"');
}

export async function createTestUser(userService: UserService, name: string, email: string, password: string) {
  return await userService.createUser(name, email, password);
}

export async function createTestMicropost(micropostService: MicroPostService, userId: number, title: string) {
  return await micropostService.createMicroPost(userId, title, null);
}

export async function createTestCategory(categoryService: CategoryService, title: string) {
  return await categoryService.createCategory(title);
}