import { Injectable } from '@nestjs/common';
import { DatabaseService, MicroPost } from '../database/database.service';

export { MicroPost };  // MicroPost インターフェースをエクスポート

@Injectable()
export class MicroPostService {
  constructor(private databaseService: DatabaseService) {}

  async create(userId: number, title: string, imagePath: string | null): Promise<MicroPost> {
    return this.databaseService.createMicroPost(userId, title, imagePath);
  }

  async list(): Promise<MicroPost[]> {  // index から list に変更
    return this.databaseService.listMicroPosts();
  }
}