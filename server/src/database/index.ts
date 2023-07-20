import { DatabasesController } from './databases.controller';

const databasesManager = new DatabasesController();

const router = databasesManager.generateRoutes();
const DatabasesService = databasesManager.databasesServiceGetter;

export { router, DatabasesService };
