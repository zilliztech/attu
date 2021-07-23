import { Module, CacheModule } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { MilvusModule } from '../milvus/milvus.module';
import { ttl } from '../cache/config';

@Module({
  imports: [
    MilvusModule,
    CacheModule.register({
      ttl, // seconds
    }),
  ],
  providers: [CollectionsService],
  controllers: [CollectionsController],
})
export class CollectionsModule { }
