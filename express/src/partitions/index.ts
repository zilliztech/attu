import express from "express";
import { PartitionsService } from "./partitions.service";
import { milvusService } from "../milvus";

const router = express.Router();

const partitionsService = new PartitionsService(milvusService);

router.get("/", async (req, res, next) => {
  const collectionName = "" + req.query?.collection_name;
  try {
    const result = await partitionsService.getPatitionsInfo({
      collection_name: collectionName,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post("/", async (req, res, next) => {
  const { type, ...params } = req.body;
  try {
    const result =
      type.toLocaleLowerCase() === "create"
        ? await partitionsService.createParition(params)
        : await partitionsService.deleteParition(params);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.put("/load", async (req, res, next) => {
  const loadData = req.body;
  try {
    const result = await partitionsService.loadPartitions(loadData);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.put("/release", async (req, res, next) => {
  const loadData = req.body;
  try {
    const result = await partitionsService.releasePartitions(loadData);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

export { router };
