import { schedule, ScheduledTask } from 'node-cron';
import { CollectionsService } from '../collections/collections.service';
import {
  WS_EVENTS,
  WS_EVENTS_TYPE,
  checkLoading,
  checkIndexing,
} from '../utils';
import { clients } from '../socket';
import { CronJobObject } from '../types';
interface CronJob {
  id: string;
  clientId: string; // milvus milvusClientId
  task: ScheduledTask;
  data: CronJobObject;
}
import { clientCache } from '../app';

const getId = (clientId: string, data: CronJobObject) => {
  return `${clientId}/${data.name}/${
    data.payload.database
  }/[${data.payload.collections.join('/')}]`;
};

export class CronsService {
  constructor(
    private collectionService: CollectionsService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async toggleCronJobByName(clientId: string, data: CronJobObject) {
    const { name, type } = data;

    // define cronJob
    const cronJob: CronJob = this.schedulerRegistry.getCronJob(clientId, data);

    // if type is stop, stop cronJob
    if (cronJob && type === WS_EVENTS_TYPE.STOP) {
      return this.schedulerRegistry.deleteCronJob(clientId, data);
    }

    // switch case for different events
    switch (name) {
      // collection loading, indexing, update
      case WS_EVENTS.COLLECTION_UPDATE:
        if (type === WS_EVENTS_TYPE.START && !cronJob) {
          return this.execCollectionUpdateTask(clientId, data);
        }
        break;

      default:
        throw new Error('Unsupported event type');
    }
  }

  async execCollectionUpdateTask(clientId: string, data: CronJobObject) {
    console.log('execCollectionUpdateTask', clientId, data);
    const task = async () => {
      const currentJob: CronJob = this.schedulerRegistry.getCronJob(
        clientId,
        data
      );

      // if currentJob is not exist
      if (!currentJob) {
        // if client not connected, stop cron
        this.schedulerRegistry.deleteCronJob(clientId, data);
        return;
      }

      try {
        // get client cache data
        const { milvusClient } = clientCache.get(clientId);
        const currentDatabase = (milvusClient as any).metadata.get('dbname');

        // if database is not matched, return
        if (currentDatabase !== data.payload.database) {
          // if client not connected, stop cron
          this.schedulerRegistry.deleteCronJob(clientId, data);
          console.info('Database is not matched, stop cron.', clientId);
          return;
        }

        const collections = await this.collectionService.getAllCollections(
          currentJob.clientId,
          currentJob.data.payload.collections
        );
        // get current socket
        const socketClient = clients.get(currentJob.clientId);

        if (socketClient) {
          // emit event to current client, loading and indexing events are indetified as collection update
          socketClient.emit(WS_EVENTS.COLLECTION_UPDATE, {
            collections,
            database: currentJob.data.payload.database,
          });

          // if all collections are loaded, stop cron
          const LoadingOrBuildingCollections = collections.filter(v => {
            const isLoading = checkLoading(v);
            const isBuildingIndex = checkIndexing(v);

            return isLoading || isBuildingIndex;
          });

          if (LoadingOrBuildingCollections.length === 0) {
            this.schedulerRegistry.deleteCronJob(clientId, data);
          }
        }
      } catch (error) {
        if (error.message.includes('pool is draining')) {
          // Handle the pool draining error, possibly by logging and avoiding retry
          console.error(
            'The pool is shutting down and cannot accept new work.'
          );
          this.schedulerRegistry.deleteCronJob(clientId, data);
          return;
        }

        // When user not connect milvus, stop cron
        this.schedulerRegistry.deleteCronJob(clientId, data);

        throw new Error(error);
      }
    };
    // every 5 seconds
    this.schedulerRegistry.setCronJob(clientId, '*/5 * * * * *', task, data);
  }
}

export class SchedulerRegistry {
  constructor(private cronJobMap: Map<string, CronJob>) {}

  getCronJob(clientId: string, data: CronJobObject) {
    const targetId = getId(clientId, data);

    const target = this.cronJobMap.get(targetId);
    return target;
  }

  deleteCronJob(clientId: string, data: CronJobObject) {
    const targetId = getId(clientId, data);

    if (this.cronJobMap.has(targetId)) {
      this.cronJobMap.get(targetId)?.task?.stop();
      this.cronJobMap.delete(targetId);
    }

    console.log('Deleted cron job:', targetId, this.cronJobMap);
  }

  deleteAllCronJobs(clientId: string) {
    console.log('Deleting all cron jobs in service for client:', clientId);
    this.cronJobMap.forEach((v, k) => {
      if (v.clientId === clientId) {
        v.task.stop();
        this.cronJobMap.delete(k);
      }
    });
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
    cronExpression: string,
    func: () => void,
    data: CronJobObject
  ) {
    const target = this.getCronJob(clientId, data);

    if (target) {
      target?.task?.stop();
    } else {
      // create task id
      const id = getId(clientId, data);

      if (!this.cronJobMap.has(id)) {
        console.log('create task:', id);
        // create task
        const task = schedule(cronExpression, () => {
          console.log(
            `[cronExpression:${cronExpression}] ${data.name} ${id}: running a task.`
          );
          func();
        });

        // save task
        this.cronJobMap.set(id, {
          id,
          clientId,
          task,
          data,
        });
      }
    }
  }
}
