import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../src/user/user.service';
import { DatabaseService } from '../src/database/database.service';
import { setupTestApp, clearDatabase, createTestUser } from './test-utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    ({ app, databaseService } = await setupTestApp());
    app.useGlobalPipes(new ValidationPipe());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(databaseService);
  });

  it('should register a new user (POST /auth/register)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    expect(response.body).toEqual({
      success: true,
      message: 'Registration successful',
    });
  });

  it('should login an existing user (POST /auth/login)', async () => {
    const userService = app.get<UserService>(UserService);
    await createTestUser(
      userService,
      'Jane Doe',
      'jane.doe@example.com',
      'securepassword123',
    );

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'jane.doe@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Login successful',
      token: expect.any(String),
      user: expect.objectContaining({
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        id: expect.any(Number),
        isAdmin: expect.any(Boolean),
      }),
    });

    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should not login with incorrect credentials (POST /auth/login)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      })
      .expect(401); // Expect 401 Unauthorized

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
  });
});
