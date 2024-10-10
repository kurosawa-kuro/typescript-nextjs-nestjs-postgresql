import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { MicropostCategoryService } from '../micropost-category/micropost-category.service';

@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(
    private readonly categoryService: CategoryService,
    private readonly micropostCategoryService: MicropostCategoryService,
  ) {}

  @Post()
  async create(@Body('title') title: string) {
    try {
      await this.categoryService.create(title);
      return { message: 'Category created' };
    } catch (error) {
      this.logger.error(
        `Failed to create category: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  @Get()
  async index() {
    try {
      const categories = await this.categoryService.list();
      return categories;
    } catch (error) {
      this.logger.error(
        `Failed to get categories: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to get categories');
    }
  }

  @Get(':categoryId/microposts')
  async microposts(@Param('categoryId') categoryId: string) {
    try {
      const id = parseInt(categoryId, 10);
      const microposts = await this.micropostCategoryService.microposts(id);
      return microposts;
    } catch (error) {
      this.logger.error(
        `Failed to get microposts for category: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to get microposts for category',
      );
    }
  }
}