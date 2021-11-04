import { CollectionsService } from "../collections/collections.service";
import { WS_EVENTS, WS_EVENTS_TYPE } from "../utils/Const";
import { schedule, ScheduledTask } from "node-cron";
import { pubSub } from "../events";

export class CronsService {
  constructor(
    private collectionService: CollectionsService,
    private schedulerRegistry: SchedulerRegistry
  ) {
    this.getCollections(WS_EVENTS.COLLECTION + "");
  }

  async toggleCronJobByName(data: { name: string; type: WS_EVENTS_TYPE }) {
    const { name, type } = data;
    const cronJobEntity = this.schedulerRegistry.getCronJob(name);
    return Number(type) === WS_EVENTS_TYPE.STOP
      ? cronJobEntity.stop()
      : cronJobEntity.start();
  }

  async getCollections(name: string) {
    const task = async () => {
      try {
        const res = await this.collectionService.getAllCollections();
        // TODO
        // this.eventService.server.emit("COLLECTION", res);
        pubSub.emit("ws_pubsub", {
          event: WS_EVENTS.COLLECTION + "",
          data: res,
        });
        return res;
      } catch (error) {
        // When user not connect milvus, stop cron
        this.toggleCronJobByName({
          name: WS_EVENTS.COLLECTION,
          type: WS_EVENTS_TYPE.STOP,
        });
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
    this.setCronJob(name, "* * * * * *", func);
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
        console.log(`${name}: running a task every seconds`);
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
