import { Test, TestingModule } from '@nestjs/testing';
import { PartitionsService } from './partitions.service';
import { MilvusServiceProvider } from '../milvus/milvus.service.mock';

describe('PartitionsService', () => {
  let service: PartitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartitionsService, MilvusServiceProvider],
    }).compile();

    service = module.get<PartitionsService>(PartitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
