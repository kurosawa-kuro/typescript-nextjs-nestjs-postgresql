import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../src/auth/auth.service';
import { UserService } from '../src/user/user.service';
import { DatabaseService } from '../src/database/database.service';
import { setupTestApp, clearDatabase, createTestUser } from './test-utils';
import { JwtService } from '@nestjs/jwt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let databaseService: DatabaseService;
  let jwtService: JwtService;

  beforeAll(async () => {
    ({ app, authService, databaseService, jwtService } = await setupTestApp());
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
    // Create a user first using AuthService or test utility function
    const userService = app.get<UserService>(UserService);
    await createTestUser(userService, 'Jane Doe', 'jane.doe@example.com', 'securepassword123');
    
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'jane.doe@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Login successful',
    });

    // Check if JWT token is set in the cookie
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should not login with incorrect credentials (POST /auth/login)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      })
      .expect(200);

    expect(response.body).toEqual({
      success: false,
      message: 'Login failed',
    });
  });

  it('should retrieve the user profile with a valid JWT (GET /auth/profile)', async () => {
    // Create a user and login to get a valid JWT
    const userService = app.get<UserService>(UserService);
    await createTestUser(userService, 'Jane Doe', 'jane.doe@example.com', 'securepassword123');
    const user = await userService.findUserByEmail('jane.doe@example.com');
    const token = jwtService.sign({ sub: user.id, email: user.email });

    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Cookie', [`jwt=${token}`]) // Send the JWT token as a cookie
      .expect(200);

    expect(response.body).toEqual({
      id: user.id,
      email: 'jane.doe@example.com',
      name: 'Jane Doe',
    });
  });

  it('should return 401 for profile request without JWT (GET /auth/profile)', async () => {
    await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(401);
  });
});
