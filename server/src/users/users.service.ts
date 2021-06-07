import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor() {
    // todo: hardcode user list for now
    this.users = [
      {
        userId: 1,
        username: 'milvus',
        password: 'milvus-admin',
      },
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
