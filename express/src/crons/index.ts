import { CronsController } from "./crons.controller";

const cronsManager = new CronsController();
const router = cronsManager.generateRoutes();

export { router };
