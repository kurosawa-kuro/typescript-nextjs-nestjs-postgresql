import { Module } from '@nestjs/common';
import { MicroPostService } from './micropost.service';
import { MicroPostController } from './micropost.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { MicropostCategoryModule } from '../micropost-category/micropost-category.module'; // Import MicropostCategoryModule to access MicropostCategoryService

@Module({
  imports: [DatabaseModule, UserModule, MicropostCategoryModule], // Add MicropostCategoryModule here
  providers: [MicroPostService],
  controllers: [MicroPostController],
  exports: [MicroPostService],
})
export class MicropostModule {}
