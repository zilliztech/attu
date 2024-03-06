import { schedule, ScheduledTask } from 'node-cron';
import { CollectionsService } from '../collections/collections.service';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../utils';
import { clients } from '../socket';
import { CronJobObject } from '../types';
interface CronJob {
  clientId: string; // milvus milvusClientId
  name: string;
  entity: ScheduledTask;
  payload?: any;
}

const isPayloadEqual = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const mergePayload = (a: string[], b: string[]) => {
  return Array.from(new Set([...a, ...b]));
};

export class CronsService {
  constructor(
    private collectionService: CollectionsService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async toggleCronJobByName(clientId: string, data: CronJobObject) {
    const { name, type, payload } = data;

    // define cronJob
    let cronJob: CronJob = this.schedulerRegistry.getCronJob(clientId, name);

    // ignore multiple start event for all collections event
    if (
      cronJob &&
      type === WS_EVENTS_TYPE.START &&
      name === cronJob.name &&
      isPayloadEqual(payload, cronJob.payload)
    ) {
      console.log(
        'ignore multiple start event for all collections event',
        data
      );
      return;
    }

    // if type is stop, stop cronJob
    if (cronJob && type === WS_EVENTS_TYPE.STOP) {
      return this.schedulerRegistry.deleteCronJob(clientId, name);
    }

    // switch case for different events
    switch (name) {
      // fetch all collections(batch update)
      case WS_EVENTS.COLLECTIONS:
        // if no cronJob and type is start, start cronJob
        if (type === WS_EVENTS_TYPE.START) {
          return this.getCollections(clientId, data);
        }
        break;

      // collection update(queue update)
      case WS_EVENTS.COLLECTION_UPDATE:
        if (type === WS_EVENTS_TYPE.START && cronJob) {
          console.log('merge payload', cronJob.payload, payload);
          cronJob.payload = mergePayload(cronJob.payload, payload);
          return;
        }

        if (type === WS_EVENTS_TYPE.START && !cronJob) {
          return this.getCollection(clientId, data);
        }
        break;

      default:
        throw new Error('Unsupported event type');
    }
  }

  async getCollections(clientId: string, data: CronJobObject) {
    // create task
    const task = async (clientId: string, name: string) => {
      try {
        const currentJob: CronJob = this.schedulerRegistry.getCronJob(
          clientId,
          name
        );

        console.log(
          `running getCollections task, payload:`,
          currentJob.payload
        );

        const res = await this.collectionService.getAllCollections(clientId);
        // get current socket
        const socketClient = clients.get(clientId);
        // emit event to current client
        socketClient.emit(WS_EVENTS.COLLECTIONS, res);
        return res;
      } catch (error) {
        // When user not connect milvus, stop cron
        this.schedulerRegistry.deleteCronJob(clientId, data.name);

        throw new Error(error);
      }
    };
    this.schedulerRegistry.setCronJobEveryFiveSecond(clientId, data.name, task);
  }

  async getCollection(clientId: string, data: CronJobObject) {
    const task = async (clientId: string, name: string) => {
      try {
        const currentJob: CronJob = this.schedulerRegistry.getCronJob(
          clientId,
          name
        );

        console.log(`running getCollection task, payload:`, currentJob.payload);

        const res = await this.collectionService.getAllCollections(
          clientId,
          currentJob.payload
        );
        // get current socket
        const socketClient = clients.get(clientId);
        // emit event to current client
        socketClient.emit(WS_EVENTS.COLLECTION_UPDATE, res);
        return res;
      } catch (error) {
        // When user not connect milvus, stop cron
        this.schedulerRegistry.deleteCronJob(clientId, data.name);

        throw new Error(error);
      }
    };
    this.schedulerRegistry.setCronJobEveryFiveSecond(
      clientId,
      data.name,
      task,
      data.payload
    );
  }
}

export class SchedulerRegistry {
  constructor(private cronJobList: CronJob[]) {}

  getCronJob(clientId: string, name: string) {
    const target = this.cronJobList.find(
      item => item.name === name && item.clientId === clientId
    );
    return target;
  }

  deleteCronJob(clientId: string, name: string) {
    const targetIndex = this.cronJobList.findIndex(
      item => item.name === name && item.clientId === clientId
    );
    if (targetIndex !== -1) {
      this.cronJobList[targetIndex].entity.stop();
      this.cronJobList.splice(targetIndex, 1);
    }
  }

  setCronJobEveryFiveSecond(
    clientId: string,
    name: string,
    func: Function,
    payload?: any
  ) {
    // The cron job will run every 5 second
    this.setCronJob(clientId, name, '*/5 * * * * *', func, payload);
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
    cronExpression: string,
    func: Function,
    payload?: any
  ) {
    const target = this.cronJobList.find(
      item => item.name === name && item.clientId === clientId
    );
    if (target) {
      target?.entity?.stop();
    } else {
      const task = schedule(cronExpression, () => {
        console.log(
          `[cronExpression:${cronExpression}] ${name}: running a task.`
        );
        func(clientId, name);
      });
      this.cronJobList.push({ clientId, name, entity: task, payload });
    }
  }
}
