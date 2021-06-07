import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionModule } from './collection/collection.module';
import { ErrorInterceptor, TransformResInterceptor } from './interceptors';
import { MilvusModule } from './milvus/milvus.module';

@Module({
  imports: [CollectionModule, MilvusModule],
  controllers: [AppController],
  providers: [
    AppService,
    // global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResInterceptor,
    },
  ],
})
export class AppModule {}
