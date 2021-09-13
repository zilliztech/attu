import { Test, TestingModule } from '@nestjs/testing';
import { CronsController } from './crons.controller';

describe('CronsController', () => {
  let controller: CronsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronsController],
    }).compile();

    controller = module.get<CronsController>(CronsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
