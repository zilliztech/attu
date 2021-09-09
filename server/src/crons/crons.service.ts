import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CollectionsService } from '../collections/collections.service';
import { WS_EVENTS, WS_EVENTS_TYPE } from 'src/utils/Const';
@Injectable()
export class CronsService {
  constructor(
    private eventService: EventsGateway,
    private collectionService: CollectionsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async toggleCronJobByName(data: { name: string; type: WS_EVENTS_TYPE }) {
    const { name, type } = data;
    const cronJob = this.schedulerRegistry.getCronJob(name);
    return Number(type) === WS_EVENTS_TYPE.STOP
      ? cronJob.stop()
      : cronJob.start();
  }

  @Cron(CronExpression.EVERY_30_SECONDS, { name: WS_EVENTS.COLLECTION })
  async getCollections() {
    const res = await this.collectionService.getAllCollections();
    this.eventService.server.emit(WS_EVENTS.COLLECTION, res);
    return res;
  }
}
