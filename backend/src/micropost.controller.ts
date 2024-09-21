import { Controller, Get, Post, Body, Param, InternalServerErrorException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { MicroPostService } from './micropost.service';
import { UserService } from './user.service';
import { MicropostCategoryService } from './micropost-category.service';

@Controller('microposts')
export class MicroPostController {
  private readonly logger = new Logger(MicroPostController.name);

  constructor(
    private readonly microPostService: MicroPostService,
    private readonly userService: UserService,
    private readonly micropostCategoryService: MicropostCategoryService
  ) {}

  @Post()
  async createMicroPost(
    @Body('userId') userId: number,
    @Body('title') title: string,
  ) {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
      const micropost = await this.microPostService.createMicroPost(userId, title);
      return { message: 'MicroPost created', micropost };
    } catch (error) {
      this.logger.error(`Failed to create micropost: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.constraint === 'micropost_user_id_fkey') {
        throw new BadRequestException(`User with id ${userId} does not exist`);
      }
      throw new InternalServerErrorException('Failed to create micropost');
    }
  }

  @Get()
  async getMicroPosts() {
    try {
      const microposts = await this.microPostService.getMicroPosts();
      return microposts;
    } catch (error) {
      this.logger.error(`Failed to get microposts: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get microposts');
    }
  }

  @Get(':id/categories')
  async getMicropostCategories(@Param('id') id: string) {
    try {
      const micropostId = parseInt(id, 10);
      const categories = await this.micropostCategoryService.getMicropostCategories(micropostId);
      return categories;
    } catch (error) {
      this.logger.error(`Failed to get categories for micropost: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get categories for micropost');
    }
  }

  @Post(':id/categories')
  async addCategoryToMicropost(
    @Param('id') id: string,
    @Body('categoryId') categoryId: number
  ) {
    try {
      const micropostId = parseInt(id, 10);
      await this.micropostCategoryService.addCategoryToMicropost(micropostId, categoryId);
      return { message: 'Category added to micropost' };
    } catch (error) {
      this.logger.error(`Failed to add category to micropost: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to add category to micropost');
    }
  }
}