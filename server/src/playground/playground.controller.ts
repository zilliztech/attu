import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { PlaygroundService } from './playground.service';
import { PlaygroundRequestDto } from './dto';

export class PlaygroundController {
  private playgroundService: PlaygroundService;
  private router: Router;

  constructor() {
    this.playgroundService = new PlaygroundService();
    this.router = Router();
  }

  get playgroundServiceGetter() {
    return this.playgroundService;
  }

  generateRoutes() {
    this.router.post(
      '/',
      dtoValidationMiddleware(PlaygroundRequestDto),
      this.handleRequest.bind(this)
    );

    return this.router;
  }

  async handleRequest(
    req: Request<{}, {}, PlaygroundRequestDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.playgroundService.makeRequest(req.body);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
