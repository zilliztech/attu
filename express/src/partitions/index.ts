import { PartitionController } from "./partitions.controller";

const partitionManager = new PartitionController();
const router = partitionManager.generateRoutes();

export { router };
