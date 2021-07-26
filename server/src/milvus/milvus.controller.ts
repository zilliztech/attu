import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from 'src/pipe/validation.pipe';
import { CheckMilvus, ConnectMilvus, Flush } from './dto';
import { MilvusService } from './milvus.service';

@ApiTags('milvus')
@Controller('milvus')
export class MilvusController {
  constructor(private milvusService: MilvusService) {}

  @Post('connect')
  @UsePipes(new ValidationPipe())
  async connect(@Body() body: ConnectMilvus): Promise<any> {
    return await this.milvusService.connectMilvus(body.address);
  }

  @Get('check')
  async checkConnect(@Query() query: CheckMilvus): Promise<any> {
    return await this.milvusService.checkConnect(query.address);
  }

  @Put('flush')
  async flush(@Body() data: Flush) {
    return await this.milvusService.flush(data);
  }
}
