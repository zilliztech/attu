import { UserController } from './users.controller';

const userManager = new UserController();
const router = userManager.generateRoutes();

export { router };
