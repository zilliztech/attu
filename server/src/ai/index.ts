import { AIController } from './ai.controller';

const aiController = new AIController();
export const router = aiController.generateRoutes();