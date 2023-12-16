import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { MilvusService } from './milvus.service';
import { ConnectMilvusDto, FlushDto, UseDatabaseDto } from './dto';
import packageJson from '../../package.json';

export class MilvusController {
  private router: Router;
  private milvusService: MilvusService;

  constructor() {
    this.milvusService = new MilvusService();
    this.router = Router();
  }

  get milvusServiceGetter() {
    return this.milvusService;
  }

  generateRoutes() {
    this.router.get('/version', this.getInfo.bind(this));
    this.router.post(
      '/connect',
      dtoValidationMiddleware(ConnectMilvusDto),
      this.connectMilvus.bind(this)
    );
    this.router.post(
      '/usedb',
      dtoValidationMiddleware(UseDatabaseDto),
      this.useDatabase.bind(this)
    );
    this.router.post('/disconnect', this.closeConnection.bind(this));
    this.router.get('/check', this.checkConnect.bind(this));
    this.router.put(
      '/flush',
      dtoValidationMiddleware(FlushDto),
      this.flush.bind(this)
    );
    this.router.get('/metrics', this.getMetrics.bind(this));

    return this.router;
  }

  async connectMilvus(req: Request, res: Response, next: NextFunction) {
    const { address, username, password, database } = req.body;
    try {
      const result = await this.milvusService.connectMilvus({
        address,
        username,
        password,
        database,
      });

      res.send(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async checkConnect(req: Request, res: Response, next: NextFunction) {
    const address = '' + req.query?.address;

    try {
      const result = await this.milvusService.checkConnect(address);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async flush(req: Request, res: Response, next: NextFunction) {
    const collectionNames = req.body;
    try {
      const result = await this.milvusService.flush(collectionNames);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.milvusService.getMetrics();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getInfo(req: Request, res: Response, next: NextFunction) {
    const data = {
      sdk: this.milvusService.sdkInfo,
      attu: packageJson.version,
    };
    res.send(data);
  }

  async useDatabase(req: Request, res: Response, next: NextFunction) {
    const { database } = req.body;

    try {
      const result = await this.milvusService.useDatabase(database);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  closeConnection(req: Request, res: Response, next: NextFunction) {
    const result = this.milvusService.closeConnection();
    res.send({ result });
  }
}
