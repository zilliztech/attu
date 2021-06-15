import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateIndex } from './dto';
import { SchemaService } from './schema.service';

@Controller('schema')
export class SchemaController {
  constructor(private schemaService: SchemaService) {}

  @Post('index')
  @UsePipes(new ValidationPipe())
  async createIndex(@Body() body: CreateIndex) {
    console.log(body);
    return await this.schemaService.createIndex(body);
  }
}
