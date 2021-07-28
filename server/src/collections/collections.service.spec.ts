import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsService } from './collections.service';
import { MilvusServiceProvider } from '../milvus/milvus.service.mock';

describe('CollectionsService', () => {
  let service: CollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionsService, MilvusServiceProvider],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
