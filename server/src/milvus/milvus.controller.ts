import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ErrorInterceptor } from 'src/interceptors';
import { ValidationPipe } from 'src/pipe/validation.pipe';
import { ConnectMilvus } from './dto';
import { MilvusService } from './milvus.service';

@Controller('milvus')
export class MilvusController {
  constructor(private milvusService: MilvusService) {}

  @Post('connect')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new ErrorInterceptor())
  async connect(@Body() body: ConnectMilvus): Promise<any> {
    return await this.milvusService.connectMilvus(body.address);
  }
}
