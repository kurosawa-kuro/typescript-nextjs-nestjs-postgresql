import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CategoryService } from '../src/category/category.service';
import { DatabaseService } from '../src/database/database.service';
import { setupTestApp, clearDatabase } from './test-utils';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let categoryService: CategoryService;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    ({ app, categoryService, databaseService } = await setupTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(databaseService);
  });

  it('should create a category (POST /categories)', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .send({ title: 'Test Category' })
      .expect(201);

    expect(response.body).toEqual({ message: 'Category created' });
  });

  it('should retrieve all categories (GET /categories)', async () => {
    await categoryService.create('Test Category 1');
    await categoryService.create('Test Category 2');

    const response = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: 'Test Category 1',
        }),
        expect.objectContaining({
          id: expect.any(Number),
          title: 'Test Category 2',
        }),
      ]),
    );
  });

  it('should retrieve microposts for a category (GET /categories/:id/microposts)', async () => {
    const category = await categoryService.create('Test Category');
    
    const response = await request(app.getHttpServer())
      .get(`/categories/${category.id}/microposts`)
      .expect(200);

    expect(response.body).toEqual([]);  // Expecting an empty array if no microposts are associated
  });
});