import { Test, TestingModule } from '@nestjs/testing';
import { MilvusController } from './milvus.controller';

describe('MilvusController', () => {
  let controller: MilvusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MilvusController],
    }).compile();

    controller = module.get<MilvusController>(MilvusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
