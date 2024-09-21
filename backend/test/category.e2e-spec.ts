import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],  // AppModuleはデータベース接続やカテゴリーサービスを含む
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a category (POST /categories)', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .send({ title: 'New Category' })
      .expect(201);  // HTTPステータスコード201を期待

    expect(response.body).toEqual({ message: 'Category created' });
  });

  it('should retrieve all categories (GET /categories)', async () => {
    await request(app.getHttpServer())
      .post('/categories')
      .send({ title: 'New Category' })  // 初期データのセットアップ
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);  // HTTPステータスコード200を期待

    expect(response.body).toEqual(expect.any(Array));
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title', 'New Category');
  });
});
