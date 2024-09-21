// micropost.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserService } from './../src/user.service';
import { MicroPostService } from './../src/micropost.service';
import { Pool } from 'pg';

describe('MicroPostController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let micropostService: MicroPostService;
  let pool: Pool;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    micropostService = moduleFixture.get<MicroPostService>(MicroPostService);
    pool = moduleFixture.get<Pool>('DATABASE_POOL');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM "micropost"');
    await pool.query('DELETE FROM "user"');
  });

  it('should create a micropost (POST /microposts)', async () => {
    const user = await userService.createUser('Test User');

    const response = await request(app.getHttpServer())
      .post('/microposts')
      .send({ userId: user.id, title: 'My first micropost' })
      .expect(201);

    expect(response.body).toHaveProperty('message', 'MicroPost created');
    expect(response.body).toHaveProperty('micropost');
    expect(response.body.micropost).toHaveProperty('id');
    expect(response.body.micropost).toHaveProperty('userId', user.id);
    expect(response.body.micropost).toHaveProperty('title', 'My first micropost');
  });

  it('should retrieve all microposts (GET /microposts)', async () => {
    const user = await userService.createUser('Another Test User');
    await micropostService.createMicroPost(user.id, 'Test micropost');

    const response = await request(app.getHttpServer())
      .get('/microposts')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
    expect(response.body.length).toBeGreaterThan(0);
    
    const testMicropost = response.body.find(post => post.title === 'Test micropost');
    expect(testMicropost).toBeDefined();
    expect(testMicropost).toHaveProperty('title', 'Test micropost');
    expect(testMicropost).toHaveProperty('userId', user.id);
  });
});