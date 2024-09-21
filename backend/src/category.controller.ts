import { Controller, Get, Post, Body, Param, InternalServerErrorException, Logger } from '@nestjs/common';
import { CategoryService } from './category.service';
import { MicropostCategoryService } from './micropost-category.service';

@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(
    private readonly categoryService: CategoryService,
    private readonly micropostCategoryService: MicropostCategoryService
  ) {}

  @Post()
  async createCategory(@Body('title') title: string) {
    try {
      await this.categoryService.createCategory(title);
      return { message: 'Category created' };
    } catch (error) {
      this.logger.error(`Failed to create category: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  @Get()
  async getCategories() {
    try {
      const categories = await this.categoryService.getCategories();
      return categories;
    } catch (error) {
      this.logger.error(`Failed to get categories: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get categories');
    }
  }

  @Get(':id/microposts')
  async getCategoryMicroposts(@Param('id') id: string) {
    try {
      const categoryId = parseInt(id, 10);
      const microposts = await this.micropostCategoryService.getCategoryMicroposts(categoryId);
      return microposts;
    } catch (error) {
      this.logger.error(`Failed to get microposts for category: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get microposts for category');
    }
  }
}