import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionModule } from './collection/collection.module';

@Module({
  imports: [CollectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
