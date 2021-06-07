import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { MilvusModule } from '../milvus/milvus.module';

@Module({
  imports: [MilvusModule],
  providers: [CollectionsService],
  controllers: [CollectionsController],
})
export class CollectionsModule {}
