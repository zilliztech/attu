import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollection } from './dto';

@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  async getCollections() {
    return await this.collectionsService.showCollections();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createCollection(@Body() data: CreateCollection) {
    return await this.collectionsService.createCollection(data);
  }

  @Delete(':name')
  // todo: need check some special symbols
  async deleteCollection(@Param('name') name: string) {
    return await this.collectionsService.dropCollection({
      collection_name: name,
    });
  }

  @Get(':name')
  async describeCollection(@Param('name') name: string) {
    return await this.collectionsService.describeCollection({
      collection_name: name,
    });
  }
}
