import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GetPartitionsInfo } from './dto';
import { PartitionsService } from './partitions.service';

@Controller('partitions')
export class PartitionsController {
  constructor(private partitionsService: PartitionsService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async getPartitions(@Query() query: GetPartitionsInfo) {
    return await this.partitionsService.getPatitionsInfo(query);
  }
}
