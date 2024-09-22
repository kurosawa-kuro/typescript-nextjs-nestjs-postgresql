import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from './../src/user.service';
import { Pool } from 'pg';
import { setupTestApp, clearDatabase, createTestUser } from './test-utils';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let pool: Pool;

  beforeAll(async () => {
    ({ app, userService, pool } = await setupTestApp());
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  beforeEach(async () => {
    await clearDatabase(pool);
  });

  it('should create a user (POST /users)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' })
      .expect(201);

    expect(response.body).toEqual(expect.objectContaining({
      message: 'User created',
      user: expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        isAdmin: false
      })
    }));
  });

  it('should retrieve all users (GET /users)', async () => {
    await createTestUser(userService, 'John Doe', 'john@example.com', 'password123');

    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toEqual(expect.objectContaining({
      name: 'John Doe',
      email: 'john@example.com',
      isAdmin: false
    }));
  });
});