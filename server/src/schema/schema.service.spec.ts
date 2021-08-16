import { Test, TestingModule } from '@nestjs/testing';
import { SchemaService } from './schema.service';
import { MilvusServiceProvider } from '../milvus/milvus.service.mock';

describe('SchemaService', () => {
  let service: SchemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaService, MilvusServiceProvider],
    }).compile();

    service = module.get<SchemaService>(SchemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
