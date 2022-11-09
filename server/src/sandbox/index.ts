import { SandboxController } from './sandbox.controller';

const sandboxManager = new SandboxController();
const router = sandboxManager.generateRoutes();

export { router };
