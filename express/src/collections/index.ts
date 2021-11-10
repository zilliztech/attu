import express from "express";
import { CollectionsService } from "./collections.service";
import { milvusService } from "../milvus";

const router = express.Router();

export const collectionsService = new CollectionsService(milvusService);

router.get("/", async (req, res, next) => {
  const type = parseInt("" + req.query?.type, 10);
  try {
    const result =
      type === 1
        ? await collectionsService.getLoadedColletions()
        : await collectionsService.getAllCollections();
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get("/statistics", async (req, res, next) => {
  try {
    const result = await collectionsService.getStatistics();
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post("/", async (req, res, next) => {
  const createCollectionData = req.body;
  try {
    const result = await collectionsService.createCollection(
      createCollectionData
    );
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.delete("/:name", async (req, res, next) => {
  const name = req.params?.name;
  try {
    const result = await collectionsService.dropCollection({
      collection_name: name,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get("/:name", async (req, res, next) => {
  const name = req.params?.name;
  try {
    const result = await collectionsService.describeCollection({
      collection_name: name,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get("/:name/statistics", async (req, res, next) => {
  const name = req.params?.name;
  try {
    const result = await collectionsService.getCollectionStatistics({
      collection_name: name,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get("/indexes/status", async (req, res, next) => {
  try {
    const result = await collectionsService.getCollectionsIndexStatus();
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.put("/:name/load", async (req, res, next) => {
  const name = req.params?.name;
  try {
    const result = await collectionsService.loadCollection({
      collection_name: name,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.put("/:name/release", async (req, res, next) => {
  const name = req.params?.name;
  try {
    const result = await collectionsService.releaseCollection({
      collection_name: name,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post("/:name/insert", async (req, res, next) => {
  const name = req.params?.name;
  const data = req.body;
  try {
    const result = await collectionsService.insert({
      collection_name: name,
      ...data,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post("/:name/search", async (req, res, next) => {
  const name = req.params?.name;
  const data = req.body;
  try {
    const result = await collectionsService.vectorSearch({
      collection_name: name,
      ...data,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post("/:name/query", async (req, res, next) => {
  const name = req.params?.name;
  const data = req.body;
  const resultiLmit: any = req.query?.limit;
  const resultPage: any = req.query?.page;
  try {
    const limit = isNaN(resultiLmit) ? 100 : parseInt(resultiLmit, 10);
    const page = isNaN(resultPage) ? 0 : parseInt(resultPage, 10);
  // TODO: add page and limit to node SDK
  // Here may raise "Error: 8 RESOURCE_EXHAUSTED: Received message larger than max"
    const result = await collectionsService.query({
      collection_name: name,
      ...data,
    });
    const queryResultList = result.data;
    const queryResultLength = result.data.length;
    const startNum = page * limit;
    const endNum = (page + 1) * limit;
    const slicedResult = queryResultList.slice(startNum, endNum);
    result.data = slicedResult;
    res.send({ ...result, limit, page, total: queryResultLength });
  } catch (error) {
    next(error);
  }
});

router.post("/:name/alias", async (req, res, next) => {
  const name = req.params?.name;
  const data = req.body;
  try {
    const result = await collectionsService.createAlias({
      collection_name: name,
      ...data,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});

export { router };
