import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CategoryService } from './../src/category.service';
import { Pool } from 'pg';
import { setupTestApp, clearDatabase } from './test-utils';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let categoryService: CategoryService;
  let pool: Pool;

  beforeAll(async () => {
    const testApp = await setupTestApp();
    app = testApp.app;
    categoryService = testApp.categoryService;
    pool = testApp.pool;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  beforeEach(async () => {
    await clearDatabase(pool);
  });

  it('should create a category (POST /categories)', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .send({ title: 'New Category' })
      .expect(201);

    expect(response.body).toEqual({ message: 'Category created' });
  });

  it('should retrieve all categories (GET /categories)', async () => {
    // カテゴリーサービスを使用してテストデータを作成
    await categoryService.createCategory('New Category');

    const response = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title', 'New Category');
  });
});