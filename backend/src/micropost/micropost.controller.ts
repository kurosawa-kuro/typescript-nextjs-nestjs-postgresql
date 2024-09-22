import { Controller, Get, Post, Body, Param, InternalServerErrorException, Logger, NotFoundException, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MicroPost, MicroPostService } from './micropost.service';
import { UserService } from '../user/user.service';
import { MicropostCategoryService } from '../micropost-category/micropost-category.service';
import * as multer from 'multer';
import * as path from 'path';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    /* istanbul ignore next */
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    /* istanbul ignore next */
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

@Controller('microposts')
export class MicroPostController {
  private readonly logger = new Logger(MicroPostController.name);

  constructor(
    private readonly microPostService: MicroPostService,
    private readonly userService: UserService,
    private readonly micropostCategoryService: MicropostCategoryService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: storage }))
  async create(
    @Body('userId') userId: number,
    @Body('title') title: string,
    @UploadedFile() file?: Express.Multer.File
  ) {
    try {
      const user = await this.userService.find(userId);
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
      const imagePath = file ? file.path : null;
      const micropost = await this.microPostService.create(userId, title, imagePath);
      return { message: 'MicroPost created', micropost };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to create micropost: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create micropost');
    }
  }

  @Get()
  async index(): Promise<MicroPost[]> {
    try {
      const microposts = await this.microPostService.index();
      return microposts.map(post => ({
        id: post.id,
        userId: post.userId,
        title: post.title,
        userName: post.userName,
        imagePath: post.imagePath
      }));
    } catch (error) {
      this.logger.error(`Failed to get microposts: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get microposts');
    }
  }

  @Get(':id/categories')
  async categories(@Param('id') id: string) {
    try {
      const micropostId = parseInt(id, 10);
      const categories = await this.micropostCategoryService.categories(micropostId);
      return categories;
    } catch (error) {
      this.logger.error(`Failed to get categories for micropost: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get categories for micropost');
    }
  }

  @Post(':id/categories')
  async add_category(
    @Param('id') id: string,
    @Body('categoryId') categoryId: number
  ) {
    try {
      const micropostId = parseInt(id, 10);
      await this.micropostCategoryService.add_category(micropostId, categoryId);
      return { message: 'Category added to micropost' };
    } catch (error) {
      this.logger.error(`Failed to add category to micropost: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to add category to micropost');
    }
  }
}