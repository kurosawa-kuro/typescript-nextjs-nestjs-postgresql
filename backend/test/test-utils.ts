// test/test-utils.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { MicroPostService } from '../src/micropost/micropost.service';
import { CategoryService } from '../src/category/category.service';
import { DatabaseService } from '../src/database/database.service';
import { MicropostCategoryService } from '../src/micropost-category/micropost-category.service';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export async function setupTestApp() {
  process.env.JWT_SECRET = 'your-secret-key'; // Ensure JWT secret is set in test environment

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const authService = moduleFixture.get<AuthService>(AuthService);
  const userService = moduleFixture.get<UserService>(UserService); // Get UserService
  const categoryService = moduleFixture.get<CategoryService>(CategoryService); // Get CategoryService
  const micropostService =
    moduleFixture.get<MicroPostService>(MicroPostService); // Get MicroPostService
  const databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
  const jwtService = moduleFixture.get<JwtService>(JwtService);

  return {
    app,
    authService,
    userService, // Return UserService
    categoryService, // Return CategoryService
    micropostService, // Return MicroPostService
    databaseService,
    jwtService,
  };
}

export async function clearDatabase(databaseService: DatabaseService) {
  await databaseService.executeQuery('DELETE FROM "micropost_category"');
  await databaseService.executeQuery('DELETE FROM "category"');
  await databaseService.executeQuery('DELETE FROM "micropost"');
  await databaseService.executeQuery('DELETE FROM "user"');
}

export async function createTestUser(
  userService: UserService,
  name: string,
  email: string,
  password: string,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const userCreationData = {
    name,
    email,
    passwordHash,
    isAdmin: false,
  };
  return await userService.create(userCreationData);
}
