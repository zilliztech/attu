import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middlewares/validation';
import { milvusService } from '../milvus';
import { DatabasesService } from './databases.service';
import { CreateDatabaseDto, DropDatabaseDto } from './dto';

export class DatabasesController {
  private databasesService: DatabasesService;
  private router: Router;

  constructor() {
    this.databasesService = new DatabasesService(milvusService);

    this.router = Router();
  }

  get databasesServiceGetter() {
    return this.databasesService;
  }

  generateRoutes() {
    this.router.get('/', this.listDatabases.bind(this));
    this.router.post(
      '/',
      dtoValidationMiddleware(CreateDatabaseDto),
      this.createDatabase.bind(this)
    );
    this.router.delete(
      '/',
      dtoValidationMiddleware(DropDatabaseDto),
      this.createDatabase.bind(this)
    );
    return this.router;
  }

  async createDatabase(req: Request, res: Response, next: NextFunction) {
    const createDatabaseData = req.body;
    try {
      const result = await this.databasesService.createDatabase(
        createDatabaseData
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async listDatabases(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.databasesService.listDatabase();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async dropDatabase(req: Request, res: Response, next: NextFunction) {
    const dropDatabaseData = req.body;
    try {
      const result = await this.databasesService.dropDatabase(dropDatabaseData);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
