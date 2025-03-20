import { PlaygroundController } from './playground.controller';

const playgroundManager = new PlaygroundController();

const router = playgroundManager.generateRoutes();
const PlaygroundService = playgroundManager.playgroundServiceGetter;

export { router, PlaygroundService };
