import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findone should be false', async () => {
    const res = await service.findOne('a');
    expect(res).toBeUndefined();
  });

  it('findone should be truth', async () => {
    const res = await service.findOne('milvus');
    expect(res).toEqual({
      userId: 1,
      username: 'milvus',
      password: 'milvus-em',
    });
  });
});
