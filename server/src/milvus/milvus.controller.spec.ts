import { Test, TestingModule } from '@nestjs/testing';
import { MilvusController } from './milvus.controller';
import { MilvusService } from './milvus.service';

describe('MilvusController', () => {
  let controller: MilvusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MilvusController],
      providers: [MilvusService]
    }).compile();

    controller = module.get<MilvusController>(MilvusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
