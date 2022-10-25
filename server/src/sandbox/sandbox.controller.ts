import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middlewares/validation';
import { SandboxService } from './sandbox.service';
import { milvusService } from '../milvus';
import { CodeStringDto } from './dto';

export class SandboxController {
  private router: Router;
  private sandboxService: SandboxService;

  constructor() {
    this.sandboxService = new SandboxService(milvusService);
    this.router = Router();
  }

  generateRoutes() {
    this.router.get('/', this.getSandbox.bind(this));

    this.router.post(
      '/',
      dtoValidationMiddleware(CodeStringDto),
      this.runNode.bind(this)
    );

    return this.router;
  }

  getSandbox(req: Request, res: Response, next: NextFunction) {
    try {
      const result = `sandbox`;
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async runNode(req: Request, res: Response, next: NextFunction) {
    console.log('run node');
    // try {
    //   const result = await this.userService.getUsers();
    //   res.send(result);
    // } catch (error) {
    //   next(error);
    // }
  }
}
