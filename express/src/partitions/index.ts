import express from "express";
import { PartitionsService } from "./partitions.service";
import { milvusService } from "../connect";

const router = express.Router();

const partitionsService = new PartitionsService(milvusService);

router.get("/", async (req, res) => {
  const collectionName = "" + req.query?.collection_name;
  try {
    const result = await partitionsService.getPatitionsInfo({
      collection_name: collectionName,
    });
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.post("/", async (req, res) => {
  const { type, ...params } = req.body;
  try {
    const result =
      type.toLocaleLowerCase() === "create"
        ? await partitionsService.createParition(params)
        : await partitionsService.deleteParition(params);
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.put("/load", async (req, res) => {
  const loadData = req.body;
  try {
    const result = await partitionsService.loadPartitions(loadData);
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.put("/release", async (req, res) => {
  const loadData = req.body;
  try {
    const result = await partitionsService.releasePartitions(loadData);
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});

export { router };
