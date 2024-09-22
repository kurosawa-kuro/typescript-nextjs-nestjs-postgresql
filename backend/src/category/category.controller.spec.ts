import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MicropostCategoryService } from '../micropost-category/micropost-category.service';
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
            create: jest.fn(),
            index: jest.fn(),
          },
        },
        {
          provide: MicropostCategoryService,
          useValue: {
            microposts: jest.fn(),
          },
        },
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    categoryService = module.get(CategoryService);
    micropostCategoryService = module.get(MicropostCategoryService);
  });

  describe('create', () => {
    it('should create a category and return a success message', async () => {
      const title = 'Technology';
      categoryService.create.mockResolvedValue(undefined);

      const result = await categoryController.create(title);

      expect(categoryService.create).toHaveBeenCalledWith(title);
      expect(result).toEqual({ message: 'Category created' });
    });

    it('should throw InternalServerErrorException when create fails', async () => {
      const title = 'Technology';
      categoryService.create.mockRejectedValue(new Error('Database error'));

      await expect(categoryController.create(title)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('index', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [{ id: 1, title: 'Technology' }];
      categoryService.index.mockResolvedValue(mockCategories);

      const result = await categoryController.index();

      expect(result).toEqual(mockCategories);
    });

    it('should throw InternalServerErrorException when index fails', async () => {
      categoryService.index.mockRejectedValue(new Error('Database error'));

      await expect(categoryController.index()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('microposts', () => {
    it('should return microposts for a given category', async () => {
      const categoryId = '1';
      const mockMicroposts = [
        { id: 1, title: 'Micropost 1', user_id: 1, user_name: 'User 1' },
      ];
      micropostCategoryService.microposts.mockResolvedValue(mockMicroposts);

      const result = await categoryController.microposts(categoryId);

      expect(micropostCategoryService.microposts).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMicroposts);
    });

    it('should throw InternalServerErrorException when microposts fails', async () => {
      const categoryId = '1';
      micropostCategoryService.microposts.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(categoryController.microposts(categoryId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
