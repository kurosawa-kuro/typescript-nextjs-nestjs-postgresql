import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UserCreationData, UserService } from '../src/user/user.service';
import { MicroPostService } from '../src/micropost/micropost.service';
import { CategoryService } from '../src/category/category.service';
import { DatabaseService } from '../src/database/database.service';
import { MicropostCategoryService } from '../src/micropost-category/micropost-category.service';

export async function setupTestApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const userService = moduleFixture.get<UserService>(UserService);
  const micropostService = moduleFixture.get<MicroPostService>(MicroPostService);
  const categoryService = moduleFixture.get<CategoryService>(CategoryService);
  const micropostCategoryService = moduleFixture.get<MicropostCategoryService>(MicropostCategoryService);
  const databaseService = moduleFixture.get<DatabaseService>(DatabaseService);

  return {
    app,
    userService,
    micropostService,
    categoryService,
    micropostCategoryService,
    databaseService,
  };
}

export async function clearDatabase(databaseService: DatabaseService) {
  await this.executeQuery('DELETE FROM "micropost_category"');
  await this.executeQuery('DELETE FROM "category"');
  await this.executeQuery('DELETE FROM "micropost"');
  await this.executeQuery('DELETE FROM "user"');
}

import * as bcrypt from 'bcrypt';

export async function createTestUser(
  userService: UserService,
  name: string,
  email: string,
  password: string,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const userCreationData: UserCreationData = {
    name, email, passwordHash, isAdmin: false,
    password: function (password: any): unknown {
      throw new Error('Function not implemented.');
    }
  };
  return await userService.create(userCreationData);
}

export async function createTestMicropost(
  micropostService: MicroPostService,
  userId: number,
  title: string,
) {
  return await micropostService.create(userId, title, null);
}

export async function createTestCategory(
  categoryService: CategoryService,
  title: string,
) {
  return await categoryService.create(title);
}