import { CollectionsService } from '../collections/collections.service';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../utils/Const';
import { schedule, ScheduledTask } from 'node-cron';
import { pubSub } from '../events';

export class CronsService {
  constructor(
    private collectionService: CollectionsService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async toggleCronJobByName(data: { name: string; type: WS_EVENTS_TYPE }) {
    const { name, type } = data;

    switch (name) {
      case WS_EVENTS.COLLECTION:
        const cronJobEntity = this.schedulerRegistry.getCronJob(name);
        if (!cronJobEntity && Number(type) === WS_EVENTS_TYPE.START) {
          return this.getCollections(WS_EVENTS.COLLECTION);
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

  async getCollections(name: string) {
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
        const cronJobEntity = this.schedulerRegistry.getCronJob(name);
        if (cronJobEntity) {
          cronJobEntity.stop();
        }

        throw new Error(error);
      }
    };
    this.schedulerRegistry.setCronJobEverySecond(name, task);
  }
}

export class SchedulerRegistry {
  constructor(private cronJobList: CronJob[]) {}

  getCronJob(name: string) {
    const target = this.cronJobList.find((item) => item.name === name);
    return target?.entity;
  }

  setCronJobEverySecond(name: string, func: () => {}) {
    // The cron job will run every second
    this.setCronJob(name, '* * * * * *', func);
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
  setCronJob(name: string, scheduler: string, func: () => {}) {
    const target = this.cronJobList.find((item) => item.name === name);
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
      });
    }
  }
}

interface CronJob {
  name: string;
  entity: ScheduledTask;
}
