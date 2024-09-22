import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DatabaseService } from '../src/database/database.service';
import { UserService } from '../src/user/user.service';

describe('MicroPostController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    ({ app, databaseService } = await setupTestApp());
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
        imagePath: 'uploads/test.jpg'
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        userId: user.id,
        title: 'Test Micropost',
        imagePath: 'uploads/test.jpg',
        userName: 'Test User',
      }),
    );
  });

  it('should retrieve all microposts (GET /microposts)', async () => {
    const user = await createTestUser(databaseService, 'Test User', 'test@example.com', 'password123');
    await databaseService.executeQuery(
      'INSERT INTO microposts (user_id, title, image_path) VALUES ($1, $2, $3)',
      [user.id, 'Test Micropost 1', 'uploads/image1.jpg']
    );
    await databaseService.executeQuery(
      'INSERT INTO microposts (user_id, title, image_path) VALUES ($1, $2, $3)',
      [user.id, 'Test Micropost 2', 'uploads/image2.jpg']
    );

    const response = await request(app.getHttpServer())
      .get('/microposts')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          userId: user.id,
          title: 'Test Micropost 1',
          imagePath: 'uploads/image1.jpg',
          userName: 'Test User',
        }),
        expect.objectContaining({
          id: expect.any(Number),
          userId: user.id,
          title: 'Test Micropost 2',
          imagePath: 'uploads/image2.jpg',
          userName: 'Test User',
        }),
      ]),
    );
  });
});
