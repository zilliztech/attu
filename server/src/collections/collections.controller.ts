import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollection, InsertData, ShowCollections } from './dto';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  async getCollections(@Query() data?: ShowCollections) {
    return Number(data.type) === 1
      ? await this.collectionsService.getLoadedColletions()
      : await this.collectionsService.getAllCollections();
  }

  @Get('statistics')
  async getStatistics() {
    return await this.collectionsService.getStatistics();
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

  @Get(':name/statistics')
  async getCollectionStatistics(@Param('name') name: string) {
    return await this.collectionsService.getCollectionStatistics({
      collection_name: name,
    });
  }

  @Get('indexes/status')
  async getCollectionsIndexState() {
    return await this.collectionsService.getCollectionsIndexStatus();
  }

  @Put(':name/load')
  async loadCollection(@Param('name') name: string) {
    return await this.collectionsService.loadCollection({
      collection_name: name,
    });
  }

  @Put(':name/release')
  async releaseCollection(@Param('name') name: string) {
    return await this.collectionsService.releaseCollection({
      collection_name: name,
    });
  }

  @Post(':name/insert')
  async insertData(@Param('name') name: string, @Body() data: InsertData) {
    return await this.collectionsService.insert({
      collection_name: name,
      ...data,
    });
  }
}
