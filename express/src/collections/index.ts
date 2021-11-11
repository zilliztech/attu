import { CollectionController } from "./collections.controller";

const collectionsManager = new CollectionController();

const router = collectionsManager.generateRoutes();
const collectionsService = collectionsManager.collectionsServiceGetter;

export { router, collectionsService };
