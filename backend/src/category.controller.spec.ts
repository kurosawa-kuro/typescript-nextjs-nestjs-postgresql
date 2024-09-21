import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MicropostCategoryService } from './micropost-category.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: jest.Mocked<CategoryService>;
  let micropostCategoryService: jest.Mocked<MicropostCategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            createCategory: jest.fn(),
            getCategories: jest.fn(),
          },
        },
        {
          provide: MicropostCategoryService,
          useValue: {
            getCategoryMicroposts: jest.fn(),
          },
        },
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    categoryService = module.get(CategoryService);
    micropostCategoryService = module.get(MicropostCategoryService);
  });

  describe('createCategory', () => {
    it('should create a category and return a success message', async () => {
      const title = 'Technology';
      categoryService.createCategory.mockResolvedValue(undefined);

      const result = await categoryController.createCategory(title);

      expect(categoryService.createCategory).toHaveBeenCalledWith(title);
      expect(result).toEqual({ message: 'Category created' });
    });

    it('should throw InternalServerErrorException when createCategory fails', async () => {
      const title = 'Technology';
      categoryService.createCategory.mockRejectedValue(new Error('Database error'));

      await expect(categoryController.createCategory(title)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getCategories', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [{ id: 1, title: 'Technology' }];
      categoryService.getCategories.mockResolvedValue(mockCategories);

      const result = await categoryController.getCategories();

      expect(result).toEqual(mockCategories);
    });

    it('should throw InternalServerErrorException when getCategories fails', async () => {
      categoryService.getCategories.mockRejectedValue(new Error('Database error'));

      await expect(categoryController.getCategories()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getCategoryMicroposts', () => {
    it('should return microposts for a given category', async () => {
      const categoryId = '1';
      const mockMicroposts = [{ id: 1, title: 'Micropost 1', user_id: 1, user_name: 'User 1' }];
      micropostCategoryService.getCategoryMicroposts.mockResolvedValue(mockMicroposts);

      const result = await categoryController.getCategoryMicroposts(categoryId);

      expect(micropostCategoryService.getCategoryMicroposts).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMicroposts);
    });

    it('should throw InternalServerErrorException when getCategoryMicroposts fails', async () => {
      const categoryId = '1';
      micropostCategoryService.getCategoryMicroposts.mockRejectedValue(new Error('Database error'));

      await expect(categoryController.getCategoryMicroposts(categoryId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});