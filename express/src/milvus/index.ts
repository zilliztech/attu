import express from "express";
import { MilvusService } from "./milvus.service";

const router = express.Router();

const milvusService = new MilvusService();

router.post("/connect", async (req, res, next) => {
  const address = req.body?.address;
  try {
    const result = await milvusService.connectMilvus(address);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get("/check", async (req, res, next) => {
  const address = "" + req.query?.address;
  try {
    const result = await milvusService.checkConnect(address);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.put("/flush", async (req, res, next) => {
  const collectionNames = req.body;
  try {
    const result = await milvusService.flush(collectionNames);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get("/metrics", async (req, res, next) => {
  try {
    const result = await milvusService.getMetrics();
    res.send(result);
  } catch (error) {
    next(error);
  }
});

export { router, milvusService };
