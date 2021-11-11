import { MilvusController } from "./milvus.controller";

const MilvusManager = new MilvusController();
const router = MilvusManager.generateRoutes();
const milvusService = MilvusManager.milvusServiceGetter;

export { router, milvusService };
