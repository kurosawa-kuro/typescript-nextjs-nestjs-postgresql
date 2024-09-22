import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../src/user/user.service';
import { MicroPostService } from '../src/micropost/micropost.service';
import { DatabaseService } from '../src/database/database.service';
import { setupTestApp, clearDatabase, createTestUser } from './test-utils';

describe('MicroPostController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let micropostService: MicroPostService;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    ({ app, userService, micropostService, databaseService } = await setupTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(databaseService);
  });

  it('should create a micropost (POST /microposts)', async () => {
    const user = await createTestUser(userService, 'Test User', 'test@example.com', 'password123');

    const response = await request(app.getHttpServer())
      .post('/microposts')
      .send({
        userId: user.id,
        title: 'Test Micropost',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        userId: user.id,
        title: 'Test Micropost',
        imagePath: null,
        userName: 'Test User',
      }),
    );
  });

  it('should retrieve all microposts (GET /microposts)', async () => {
    const user = await createTestUser(userService, 'Test User', 'test@example.com', 'password123');
    await micropostService.create(user.id, 'Test Micropost 1', null);
    await micropostService.create(user.id, 'Test Micropost 2', null);

    const response = await request(app.getHttpServer())
      .get('/microposts')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          userId: user.id,
          title: 'Test Micropost 1',
          imagePath: null,
          userName: 'Test User',
        }),
        expect.objectContaining({
          id: expect.any(Number),
          userId: user.id,
          title: 'Test Micropost 2',
          imagePath: null,
          userName: 'Test User',
        }),
      ]),
    );
  });
});