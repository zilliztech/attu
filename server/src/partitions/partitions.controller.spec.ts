import { Test, TestingModule } from '@nestjs/testing';
import { PartitionsController } from './partitions.controller';
import { PartitionsService } from './partitions.service';
import { MilvusServiceProvider } from '../milvus/milvus.service.mock';

describe('PartitionsController', () => {
  let controller: PartitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartitionsController],
      providers: [PartitionsService, MilvusServiceProvider],
    }).compile();

    controller = module.get<PartitionsController>(PartitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
