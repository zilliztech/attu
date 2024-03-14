import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { DatabasesService } from './databases.service';
import { CreateDatabaseDto } from './dto';
import { DatabaseObject } from '../types';

export class DatabasesController {
  private databasesService: DatabasesService;
  private router: Router;

  constructor() {
    this.databasesService = new DatabasesService();

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

    this.router.delete('/:name', this.dropDatabase.bind(this));

    return this.router;
  }

  async createDatabase(req: Request, res: Response, next: NextFunction) {
    const createDatabaseData = req.body;
    try {
      const result = await this.databasesService.createDatabase(
        req.clientId,
        createDatabaseData
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async listDatabases(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.databasesService.listDatabase(req.clientId);
      result.sort((a: DatabaseObject, b: DatabaseObject) => {
        if (a.name === 'default') {
          return -1; // 'default' comes before other strings
        } else if (b.name === 'default') {
          return 1; // 'default' comes after other strings
        } else {
          return a.name.localeCompare(b.name); // sort other strings alphabetically
        }
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async dropDatabase(req: Request, res: Response, next: NextFunction) {
    const db_name = req.params?.name;
    try {
      const result = await this.databasesService.dropDatabase(req.clientId, {
        db_name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
