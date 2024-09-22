import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from './../src/user.service';
import { MicroPostService } from './../src/micropost.service';
import { Pool } from 'pg';
import { setupTestApp, clearDatabase, createTestUser, createTestMicropost } from './test-utils';

describe('MicroPostController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let micropostService: MicroPostService;
  let pool: Pool;

  beforeAll(async () => {
    ({ app, userService, micropostService, pool } = await setupTestApp());
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  beforeEach(async () => {
    await clearDatabase(pool);
  });

  it('should create a micropost (POST /microposts)', async () => {
    const user = await createTestUser(userService, 'Test User', 'test@example.com', 'password123');

    const response = await request(app.getHttpServer())
      .post('/microposts')
      .send({ userId: user.id, title: 'My first micropost' })
      .expect(201);

    expect(response.body).toHaveProperty('message', 'MicroPost created');
    expect(response.body).toHaveProperty('micropost');
    expect(response.body.micropost).toHaveProperty('id');
    expect(response.body.micropost).toHaveProperty('userId', user.id);
    expect(response.body.micropost).toHaveProperty('title', 'My first micropost');
    expect(response.body.micropost).toHaveProperty('userName', 'Test User');
  });

  it('should retrieve all microposts (GET /microposts)', async () => {
    const user = await createTestUser(userService, 'Another Test User', 'another@example.com', 'password123');
    await createTestMicropost(micropostService, user.id, 'Test micropost');

    const response = await request(app.getHttpServer())
      .get('/microposts')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
    expect(response.body.length).toBeGreaterThan(0);
    
    const testMicropost = response.body.find(post => post.title === 'Test micropost');
    expect(testMicropost).toBeDefined();
    expect(testMicropost).toHaveProperty('title', 'Test micropost');
    expect(testMicropost).toHaveProperty('userId', user.id);
    expect(testMicropost).toHaveProperty('userName', 'Another Test User');
  });

  it('should create a micropost with correct user name (POST /microposts)', async () => {
    const user = await createTestUser(userService, 'John Doe', 'john@example.com', 'password123');

    const response = await request(app.getHttpServer())
      .post('/microposts')
      .send({ userId: user.id, title: 'John\'s micropost' })
      .expect(201);

    expect(response.body.micropost).toHaveProperty('userName', 'John Doe');
  });

  it('should retrieve microposts with user names (GET /microposts)', async () => {
    const user1 = await createTestUser(userService, 'Alice', 'alice@example.com', 'password123');
    const user2 = await createTestUser(userService, 'Bob', 'bob@example.com', 'password123');
    await createTestMicropost(micropostService, user1.id, 'Alice\'s post');
    await createTestMicropost(micropostService, user2.id, 'Bob\'s post');

    const response = await request(app.getHttpServer())
      .get('/microposts')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
    expect(response.body.length).toBe(2);

    const alicePost = response.body.find(post => post.title === 'Alice\'s post');
    const bobPost = response.body.find(post => post.title === 'Bob\'s post');

    expect(alicePost).toHaveProperty('userName', 'Alice');
    expect(bobPost).toHaveProperty('userName', 'Bob');
  });
});