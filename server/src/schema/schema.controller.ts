import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { SchemaService } from './schema.service';
import { ManageIndexDto } from './dto';

export class SchemaController {
  private router: Router;
  private schemaService: SchemaService;

  constructor() {
    this.schemaService = new SchemaService();
    this.router = Router();
  }

  generateRoutes() {
    this.router.post(
      '/index',
      dtoValidationMiddleware(ManageIndexDto),
      this.manageIndex.bind(this)
    );

    this.router.get('/index', this.describeIndex.bind(this));
    this.router.post('/index/flush', this.clearCache.bind(this));

    return this.router;
  }

  async manageIndex(req: Request, res: Response, next: NextFunction) {
    const { type, collection_name, index_name, extra_params, field_name } =
      req.body;
    try {
      const result =
        type.toLocaleLowerCase() === 'create'
          ? await this.schemaService.createIndex(req.clientId, {
              collection_name,
              extra_params,
              field_name,
              index_name,
            })
          : await this.schemaService.dropIndex(req.clientId, {
              collection_name,
              field_name,
              index_name,
            });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async describeIndex(req: Request, res: Response, next: NextFunction) {
    const data = '' + req.query?.collection_name;
    try {
      const result = await this.schemaService.describeIndex(req.clientId, {
        collection_name: data,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async clearCache(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.schemaService.clearCache(req.clientId);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
