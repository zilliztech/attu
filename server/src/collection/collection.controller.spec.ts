import { Test, TestingModule } from '@nestjs/testing';
import { CollectionController } from './collection.controller';

describe('CollectionController', () => {
  let controller: CollectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
