import { schedule, ScheduledTask } from 'node-cron';
import { CollectionsService } from '../collections/collections.service';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../utils';
import { serverEvent } from '../events';

export class CronsService {
  constructor(
    private collectionService: CollectionsService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async toggleCronJobByName(
    clientId: string,
    data: {
      name: string;
      type: WS_EVENTS_TYPE;
    }
  ) {
    const { name, type } = data;

    switch (name) {
      case WS_EVENTS.COLLECTION:
        const cronJobEntity = this.schedulerRegistry.getCronJob(clientId, name);
        if (!cronJobEntity && Number(type) === WS_EVENTS_TYPE.START) {
          return this.getCollections(clientId, WS_EVENTS.COLLECTION);
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

  async getCollections(clientId: string, name: string) {
    const task = async () => {
      try {
        const res = await this.collectionService.getAllCollections(clientId);
        // TODO
        // this.eventService.server.emit("COLLECTION", res);
        serverEvent.emit(WS_EVENTS.TO_CLIENT, {
          event: WS_EVENTS.COLLECTION + '',
          data: res,
        });
        return res;
      } catch (error) {
        // When user not connect milvus, stop cron
        const cronJobEntity = this.schedulerRegistry.getCronJob(clientId, name);
        if (cronJobEntity) {
          cronJobEntity.stop();
        }

        throw new Error(error);
      }
    };
    this.schedulerRegistry.setCronJobEveryFiveSecond(clientId, name, task);
  }
}

export class SchedulerRegistry {
  constructor(private cronJobList: CronJob[]) {}

  getCronJob(clientId: string, name: string) {
    const target = this.cronJobList.find(
      item => item.name === name && item.clientId === clientId
    );
    return target?.entity;
  }

  setCronJobEveryFiveSecond(clientId: string, name: string, func: () => {}) {
    // The cron job will run every second
    this.setCronJob(clientId, name, '*/5 * * * * *', func);
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
  setCronJob(
    clientId: string,
    name: string,
    scheduler: string,
    func: () => {}
  ) {
    const target = this.cronJobList.find(
      item => item.name === name && item.clientId === clientId
    );
    if (target) {
      target?.entity?.stop();
    } else {
      const task = schedule(scheduler, () => {
        console.log(`[Scheduler:${scheduler}] ${name}: running a task.`);
        func();
      });
      this.cronJobList.push({ clientId, name, entity: task });
    }
  }
}

interface CronJob {
  clientId: string; // milvus milvusClientId
  name: string;
  entity: ScheduledTask;
}
