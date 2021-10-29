import express from "express";
import { MilvusService } from "./milvus.service";

const router = express.Router();

const milvusService = new MilvusService();

router.post("/connect", async (req, res) => {
  const address = req.body?.address;
  try {
    const result = await milvusService.connectMilvus(address);
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.get("/check", async (req, res) => {
  const address = "" + req.query?.address;
  try {
    const result = await milvusService.checkConnect(address);
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.put("/flush", async (req, res) => {
  const collectionNames = req.body;
  try {
    const result = await milvusService.flush(collectionNames);
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.get("/metrics", async (req, res) => {
  const result = await milvusService.getMetrics();
  res.send({ data: result, statusCode: 200 });
});

export { router, milvusService };
