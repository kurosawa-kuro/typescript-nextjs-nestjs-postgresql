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

  // it('should retrieve the user profile with a valid JWT (GET /auth/profile)', async () => {
  //   const userService = app.get<UserService>(UserService);
  //   await createTestUser(userService, 'Jane Doe', 'jane.doe@example.com', 'securepassword123');
  //   const user = await userService.findUserByEmail('jane.doe@example.com');
  //   const token = jwtService.sign({ sub: user.id, email: user.email });
  //   console.log('★★★★ Token:', token);
  
  //   const response = await request(app.getHttpServer())
  //     .get('/auth/profile')
  //     .set('Cookie', [`jwt=${token}`]) // Send the JWT token as a cookie
  //     .expect(200); // Expect success if the JWT is valid
  
  //     console.log('★★★★ response:', response);

  //   expect(response.body).toEqual({
  //     id: user.id,
  //     email: 'jane.doe@example.com',
  //     name: 'Jane Doe',
  //   });
  // });

  
  // it('should return 401 for profile request without JWT (GET /auth/profile)', async () => {
  //   const response = await request(app.getHttpServer())
  //     .get('/auth/profile')
  //     .expect(401); // Expect 401 Unauthorized
  
  //   expect(response.body).toEqual({
  //     statusCode: 401,
  //     message: 'JWT token missing',
  //     error: 'Unauthorized',
  //   });
  // });
});
