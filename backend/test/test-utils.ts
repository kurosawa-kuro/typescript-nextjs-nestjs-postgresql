import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { MicroPostService } from '../src/micropost/micropost.service';
import { CategoryService } from '../src/category/category.service';
import { DatabaseService } from '../src/database/database.service';
import { MicropostCategoryService } from '../src/micropost-category/micropost-category.service';
import * as bcrypt from 'bcrypt';

// Function to setup the test application
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

// Function to clear the database
export async function clearDatabase(databaseService: DatabaseService) {
  await databaseService.executeQuery('DELETE FROM "micropost_category"');
  await databaseService.executeQuery('DELETE FROM "category"');
  await databaseService.executeQuery('DELETE FROM "micropost"');
  await databaseService.executeQuery('DELETE FROM "user"');
}

// Function to create a test user
export async function createTestUser(
  userService: UserService,
  name: string,
  email: string,
  password: string,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const userCreationData = {
    name, email, passwordHash, isAdmin: false,
    password: function (password: any): unknown {
      throw new Error('Function not implemented.');
    }
  };
  return await userService.create(userCreationData);
}

// Additional utility functions can also be included here if necessary
