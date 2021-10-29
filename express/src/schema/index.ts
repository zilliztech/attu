import express from "express";
import { SchemaService } from "./schema.service";
import { milvusService } from "../connect";

const router = express.Router();

const schemaService = new SchemaService(milvusService);

router.post("/index", async (req, res) => {
  const { type, collection_name, extra_params, field_name } = req.body;
  try {
    const result =
      type.toLocaleLowerCase() === "create"
        ? await schemaService.createIndex({
            collection_name,
            extra_params,
            field_name,
          })
        : await schemaService.dropIndex({ collection_name, field_name });
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.get("/index", async (req, res) => {
  const data = "" + req.query?.collection_name;
  try {
    const result = await schemaService.describeIndex({ collection_name: data });
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.get("/index/progress", async (req, res) => {
  const data = "" + req.query?.collection_name;
  try {
    const result = await schemaService.getIndexBuildProgress({
      collection_name: data,
    });
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.get("/index/state", async (req, res) => {
  const data = "" + req.query?.collection_name;
  try {
    const result = await schemaService.getIndexState({ collection_name: data });
    res.send({ data: result, statusCode: 200 });
  } catch (error) {
    res.status(500).send({ error });
  }
});

export { router };
