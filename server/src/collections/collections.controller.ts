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
  CACHE_MANAGER,
  Inject,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import {
  CreateCollection,
  InsertData,
  ShowCollections,
  VectorSearch,
} from './dto';
import { cacheKeys } from '../cache/config';

//Including 2 kind of cache contorl, check getCollections and getStatistics for detail
@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  // manually control cache if logic is complicated
  @Get()
  async getCollections(@Query() data?: ShowCollections) {
    if (Number(data.type) === 1) {
      let loadedCollections = await this.cacheManager.get(cacheKeys.LOADEDCOLLECTIONS);
      if (loadedCollections) {
        return loadedCollections;
      }
      loadedCollections = await this.collectionsService.getLoadedColletions();
      await this.cacheManager.set(cacheKeys.LOADEDCOLLECTIONS, loadedCollections);
      return loadedCollections;
    }
    let allCollections = await this.cacheManager.get(cacheKeys.ALLCOLLECTIONS);
    if (allCollections) {
      return allCollections;
    }
    allCollections = await this.collectionsService.getAllCollections();
    await this.cacheManager.set(cacheKeys.ALLCOLLECTIONS, allCollections);
    return allCollections;
  }

  // use interceptor to control cache automatically
  @Get('statistics')
  @UseInterceptors(CacheInterceptor)
  async getStatistics() {
    return await this.collectionsService.getStatistics();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createCollection(@Body() data: CreateCollection) {
    await this.cacheManager.del(cacheKeys.ALLCOLLECTIONS);
    return await this.collectionsService.createCollection(data);
  }

  @Delete(':name')
  // todo: need check some special symbols
  async deleteCollection(@Param('name') name: string) {
    await this.cacheManager.del(cacheKeys.ALLCOLLECTIONS);
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
    await this.cacheManager.del(cacheKeys.LOADEDCOLLECTIONS);
    return await this.collectionsService.loadCollection({
      collection_name: name,
    });
  }

  @Put(':name/release')
  async releaseCollection(@Param('name') name: string) {
    await this.cacheManager.del(cacheKeys.LOADEDCOLLECTIONS);
    return await this.collectionsService.releaseCollection({
      collection_name: name,
    });
  }

  @Post(':name/insert')
  async insertData(@Param('name') name: string, @Body() data: InsertData) {
    await this.cacheManager.del(cacheKeys.ALLCOLLECTIONS);
    return await this.collectionsService.insert({
      collection_name: name,
      ...data,
    });
  }

  @Post(':name/search')
  async vectorSearch(@Param('name') name: string, @Body() data: VectorSearch) {
    return await this.collectionsService.vectorSearch({
      collection_name: name,
      ...data,
    });
  }
}
