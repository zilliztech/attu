import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ErrorInterceptor, TransformResInterceptor } from './interceptors';
import { MilvusModule } from './milvus/milvus.module';
import { CollectionsModule } from './collections/collections.module';
import { join } from 'path';
import { PartitionsModule } from './partitions/partitions.module';
import { SchemaModule } from './schema/schema.module';
import { EventsModule } from './events/events.module';
import { LoggingInterceptor } from './interceptors/index';
import { CronsModule } from './crons/crons.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Milvus insight will be available in one docker, so we will build client files in server's client directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../', 'build'),
      // renderPath: '/', // only root render static html
    }),
    // used for connection and checking server stats
    // TODO: rename to Connect
    MilvusModule,
    // used for manage collection
    CollectionsModule,
    // used for manage partitions
    PartitionsModule,
    // used for manage index
    SchemaModule,
    // used for events communication
    EventsModule,
    CronsModule,
    ScheduleModule.forRoot(),
  ],
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
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
