import { Test, TestingModule } from '@nestjs/testing';
import { PartitionsController } from './partitions.controller';

describe('PartitionsController', () => {
  let controller: PartitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartitionsController],
    }).compile();

    controller = module.get<PartitionsController>(PartitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
