import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { CronsService, SchedulerRegistry } from './crons.service';
import { collectionsService } from '../collections';
import { ToggleCronJobByNameDto } from './dto';

export class CronsController {
  private router: Router;
  private schedulerRegistry: SchedulerRegistry;
  private cronsService: CronsService;

  constructor() {
    this.schedulerRegistry = new SchedulerRegistry([]);
    this.cronsService = new CronsService(
      collectionsService,
      this.schedulerRegistry
    );
    this.router = Router();
  }

  generateRoutes() {
    this.router.put(
      '/',
      dtoValidationMiddleware(ToggleCronJobByNameDto),
      this.toggleCronJobByName.bind(this)
    );

    return this.router;
  }

  async toggleCronJobByName(req: Request, res: Response, next: NextFunction) {
    const cronData = req.body;
    // console.log(cronData, milvusAddress);
    try {
      const result = await this.cronsService.toggleCronJobByName(req.clientId, {
        ...cronData,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
