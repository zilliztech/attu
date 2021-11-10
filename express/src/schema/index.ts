import { SchemaController } from "./schema.controller";
const schemaManager = new SchemaController();
const router = schemaManager.generateRoutes();

export { router };
