import { CollectionsService } from '../collections/collections.service';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../utils/Const';
import { schedule, ScheduledTask } from 'node-cron';
import { pubSub } from '../events';

export class CronsService {
  constructor(
    private collectionService: CollectionsService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async toggleCronJobByName(data: {
    name: string;
    type: WS_EVENTS_TYPE;
    address: string;
  }) {
    const { name, type, address } = data;

    switch (name) {
      case WS_EVENTS.COLLECTION:
        const cronJobEntity = this.schedulerRegistry.getCronJob(name, address);
        if (!cronJobEntity && Number(type) === WS_EVENTS_TYPE.START) {
          return this.getCollections(WS_EVENTS.COLLECTION, address);
        }
        if (!cronJobEntity) {
          return;
        }
        return Number(type) === WS_EVENTS_TYPE.STOP
          ? cronJobEntity.stop()
          : cronJobEntity.start();
      default:
        throw new Error('Unsupported event type');
    }
  }

  async getCollections(name: string, address: string) {
    const task = async () => {
      try {
        const res = await this.collectionService.getAllCollections();
        // TODO
        // this.eventService.server.emit("COLLECTION", res);
        pubSub.emit('ws_pubsub', {
          event: WS_EVENTS.COLLECTION + '',
          data: res,
        });
        return res;
      } catch (error) {
        // When user not connect milvus, stop cron
        const cronJobEntity = this.schedulerRegistry.getCronJob(name, address);
        if (cronJobEntity) {
          cronJobEntity.stop();
        }

        throw new Error(error);
      }
    };
    this.schedulerRegistry.setCronJobEveryFiveSecond(name, task, address);
  }
}

export class SchedulerRegistry {
  constructor(private cronJobList: CronJob[]) {}

  getCronJob(name: string, address: string) {
    const target = this.cronJobList.find(
      item => item.name === name && item.address === address
    );
    return target?.entity;
  }

  setCronJobEveryFiveSecond(name: string, func: () => {}, address: string) {
    // The cron job will run every second
    this.setCronJob(name, '*/5 * * * * *', func, address);
  }

  // ┌────────────── second (optional)
  // │ ┌──────────── minute
  // │ │ ┌────────── hour
  // │ │ │ ┌──────── day of month
  // │ │ │ │ ┌────── month
  // │ │ │ │ │ ┌──── day of week
  // │ │ │ │ │ │
  // │ │ │ │ │ │
  // * * * * * *
  // https://www.npmjs.com/package/node-cron
  setCronJob(name: string, scheduler: string, func: () => {}, address: string) {
    const target = this.cronJobList.find(
      item => item.name === name && item.address === address
    );
    if (target) {
      target?.entity?.stop();
    } else {
      const task = schedule(scheduler, () => {
        console.log(`[Scheduler:${scheduler}] ${name}: running a task.`);
        func();
      });
      this.cronJobList.push({
        name,
        entity: task,
        address,
      });
    }
  }
}

interface CronJob {
  name: string;
  entity: ScheduledTask;
  address: string; // milvus address
}
