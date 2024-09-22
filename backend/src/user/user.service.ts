import { Injectable } from '@nestjs/common';
import { DatabaseService, User, CreateUserDto } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;
    const passwordHash = await this.hashPassword(password);
    return this.databaseService.createUser({ name, email, passwordHash, isAdmin: false });
  }

  async findUser(id: number): Promise<User | null> {
    return this.databaseService.findUser(id);
  }

  async indexUsers(): Promise<User[]> {
    return this.databaseService.indexUsers();
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}