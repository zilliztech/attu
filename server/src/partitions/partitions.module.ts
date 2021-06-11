import { Module } from '@nestjs/common';
import { PartitionsService } from './partitions.service';
import { PartitionsController } from './partitions.controller';
import { MilvusModule } from 'src/milvus/milvus.module';

@Module({
  imports: [MilvusModule],
  providers: [PartitionsService],
  controllers: [PartitionsController],
})
export class PartitionsModule {}
