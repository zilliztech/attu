import { Test, TestingModule } from '@nestjs/testing';
import { CronsService } from './crons.service';

describe('CronsService', () => {
  let service: CronsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronsService],
    }).compile();

    service = module.get<CronsService>(CronsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
