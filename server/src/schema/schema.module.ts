import { Module } from '@nestjs/common';
import { MilvusModule } from '../milvus/milvus.module';
import { SchemaController } from './schema.controller';
import { SchemaService } from './schema.service';

@Module({
  imports: [MilvusModule],
  controllers: [SchemaController],
  providers: [SchemaService],
})
export class SchemaModule {}
