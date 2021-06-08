import { Test, TestingModule } from '@nestjs/testing';
import { MilvusService } from './milvus.service';

describe('MilvusService', () => {
  let service: MilvusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MilvusService],
    }).compile();

    service = module.get<MilvusService>(MilvusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
