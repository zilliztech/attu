import express from "express";
import { CronsService, SchedulerRegistry } from "./crons.service";
import { collectionsService } from "../collections";

const router = express.Router();

const schedulerRegistry = new SchedulerRegistry([]);

const cronsService = new CronsService(collectionsService, schedulerRegistry);

router.put("/", async (req, res, next) => {
  const cronData = req.body;
  try {
    const result = await cronsService.toggleCronJobByName(cronData);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

export { router };
