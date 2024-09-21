// user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserService } from './../src/user.service';
import { Pool } from 'pg';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let pool: Pool;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    pool = moduleFixture.get<Pool>('DATABASE_POOL');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM "user"');
  });

  it('should create a user (POST /users)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201);

    expect(response.body).toEqual({ message: 'User created' });
  });

  it('should retrieve all users (GET /users)', async () => {
    // テストデータを作成
    await userService.createUser('John Doe');

    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('name', 'John Doe');
  });
});