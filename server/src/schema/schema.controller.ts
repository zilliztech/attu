import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  DescribeIndex,
  GetIndexProgress,
  ManageIndex,
  ManageType,
  GetIndexState,
} from './dto';
import { SchemaService } from './schema.service';

@Controller('schema')
export class SchemaController {
  constructor(private schemaService: SchemaService) {}

  @Post('index')
  @UsePipes(new ValidationPipe())
  async manageIndex(@Body() body: ManageIndex) {
    const { type, collection_name, extra_params, field_name } = body;
    return type === ManageType.CREATE
      ? await this.schemaService.createIndex({
          collection_name,
          extra_params,
          field_name,
        })
      : await this.schemaService.dropIndex({ collection_name, field_name });
  }

  @Get('index')
  @UsePipes(new ValidationPipe())
  async describeIndex(@Query() query: DescribeIndex) {
    return await this.schemaService.describeIndex(query);
  }

  @Get('index/progress')
  @UsePipes(new ValidationPipe())
  async getIndexProgress(@Query() query: GetIndexProgress) {
    return await this.schemaService.getIndexBuildProgress(query);
  }

  @Get('index/state')
  @UsePipes(new ValidationPipe())
  async getIndexState(@Query() query: GetIndexState) {
    return await this.schemaService.getIndexState(query);
  }
}
