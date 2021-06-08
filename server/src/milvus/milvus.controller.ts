import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ErrorInterceptor } from 'src/interceptors';
import { ValidationPipe } from 'src/pipe/validation.pipe';
import { ConnectMilvus } from './dto';
import { MilvusService } from './milvus.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('milvus')
export class MilvusController {
  constructor(private milvusService: MilvusService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('connect')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new ErrorInterceptor())
  async connect(@Body() body: ConnectMilvus): Promise<any> {
    return await this.milvusService.connectMilvus(body.address);
  }
}
