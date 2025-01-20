import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { DatabasesService } from './databases.service';
import { DatabaseNameDto, DatabasePropertiesDto } from './dto';
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
      dtoValidationMiddleware(DatabaseNameDto),
      this.createDatabase.bind(this)
    );

    this.router.get('/:db_name', this.describeDatabase.bind(this));
    this.router.delete('/:db_name', this.dropDatabase.bind(this));
    this.router.put('/:db_name/properties', this.alterDatabase.bind(this));

    return this.router;
  }

  async createDatabase(
    req: Request<{}, {}, DatabaseNameDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.databasesService.createDatabase(
        req.clientId,
        req.body
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

  async dropDatabase(
    req: Request<DatabaseNameDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.databasesService.dropDatabase(req.clientId, {
        db_name: req.params.db_name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async describeDatabase(
    req: Request<DatabaseNameDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.databasesService.describeDatabase(
        req.clientId,
        {
          db_name: req.params.db_name,
        }
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async alterDatabase(
    req: Request<DatabaseNameDto, {}, DatabasePropertiesDto>,
    res: Response,
    next: NextFunction
  ) {
    const { properties } = req.body;

    try {
      const result = await this.databasesService.alterDatabase(req.clientId, {
        db_name: req.params.db_name,
        properties,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
