import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MicroPost, MicroPostService } from './micropost.service';
import { UserService } from '../user/user.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('microposts')
export class MicroPostController {
  constructor(
    private readonly microPostService: MicroPostService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join('');

          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('title') title: string,
    @Body('categoryIds') categoryIds: string | string[],
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MicroPost> {
    if (!title) {
      throw new BadRequestException('Title is required');
    }

    const user = await this.userService.find(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const imagePath = file ? file.path : null;

    let parsedCategoryIds: number[] = [];
    if (categoryIds) {
      if (Array.isArray(categoryIds)) {
        parsedCategoryIds = categoryIds.map(Number);
      } else if (typeof categoryIds === 'string') {
        parsedCategoryIds = categoryIds.split(',').map(Number);
      }
    }

    return this.microPostService.create(userId, title, imagePath, parsedCategoryIds);
  }

  @Get()
  async index(): Promise<MicroPost[]> {
    return this.microPostService.list();
  }

  @Get(':id')
  async getMicropost(@Param('id', ParseIntPipe) id: number): Promise<MicroPost> {
    const micropost = await this.microPostService.findById(id);
    if (!micropost) {
      throw new BadRequestException('Micropost not found');
    }
    return micropost;
  }
}
