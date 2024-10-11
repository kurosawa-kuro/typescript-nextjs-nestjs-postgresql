import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DatabaseService } from '../../src/database/database.service';
import { UserService } from '../../src/user/user.service';
import { setupTestApp, clearDatabase, createTestUser } from './test-utils';
import * as path from 'path';

describe('MicroPostController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let userService: UserService;

  beforeAll(async () => {
    ({ app, databaseService, userService } = await setupTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(databaseService);
  });

  it('should create a micropost (POST /microposts)', async () => {
    const user = await createTestUser(
      userService,
      'Test User',
      'test@example.com',
      'password123',
    );

    const testImagePath = path.join(__dirname, '..', 'test.png');

    const response = await request(app.getHttpServer())
      .post('/microposts')
      .field('userId', user.id.toString())
      .field('title', 'Test Micropost')
      .attach('image', testImagePath)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      title: 'Test Micropost',
      imagePath: expect.stringMatching(/^[a-f0-9]{32}\.png$/),
      user: {
        id: user.id,
        name: 'Test User',
        avatarPath: expect.any(String),
      },
    });
  });

  it('should retrieve all microposts (GET /microposts)', async () => {
    const user = await createTestUser(
      userService,
      'Test User',
      'test@example.com',
      'password123',
    );
    await databaseService.executeQuery(
      'INSERT INTO micropost (user_id, title, image_path) VALUES ($1, $2, $3)',
      [user.id, 'Test Micropost 1', 'image1.jpg'],
    );
    await databaseService.executeQuery(
      'INSERT INTO micropost (user_id, title, image_path) VALUES ($1, $2, $3)',
      [user.id, 'Test Micropost 2', 'image2.jpg'],
    );

    const response = await request(app.getHttpServer())
      .get('/microposts')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: 'Test Micropost 2',
          imagePath: 'image2.jpg',
          user: {
            id: user.id,
            name: 'Test User',
            avatarPath: expect.any(String),
          },
          categories: expect.any(Array),
        }),
        expect.objectContaining({
          id: expect.any(Number),
          title: 'Test Micropost 1',
          imagePath: 'image1.jpg',
          user: {
            id: user.id,
            name: 'Test User',
            avatarPath: expect.any(String),
          },
          categories: expect.any(Array),
        }),
      ]),
    );

    // Check if the order is correct (newest first)
    expect(response.body[0].title).toBe('Test Micropost 2');
    expect(response.body[1].title).toBe('Test Micropost 1');
  });
});