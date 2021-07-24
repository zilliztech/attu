import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  GetPartitionsInfo,
  LoadPartitions,
  ManagePartition,
  ManageType,
} from './dto';
import { PartitionsService } from './partitions.service';

@ApiTags('partitions')
@Controller('partitions')
export class PartitionsController {
  constructor(private partitionsService: PartitionsService) { }

  @Get()
  @UsePipes(new ValidationPipe())
  async getPartitions(@Query() query: GetPartitionsInfo) {
    return await this.partitionsService.getPatitionsInfo(query);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async managePartition(@Body() body: ManagePartition) {
    const { type, ...params } = body;

    return type.toLocaleLowerCase() === ManageType.CREATE
      ? await this.partitionsService.createParition(params)
      : await this.partitionsService.deleteParition(params);
  }

  @Put('load')
  @UsePipes(new ValidationPipe())
  async loadPartition(@Body() body: LoadPartitions) {
    return await this.partitionsService.loadPartitions(body);
  }

  @Put('release')
  @UsePipes(new ValidationPipe())
  async releasePartitions(@Body() body: LoadPartitions) {
    return await this.partitionsService.loadPartitions(body);
  }
}
