import { NextFunction, Request, Response, Router } from "express";
import { dtoValidationMiddleware } from "../middlewares/validation";
import { MilvusService } from "./milvus.service";
import { CheckMilvusDto, ConnectMilvusDto, FlushDto } from "./dto";

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
    this.router.post(
      "/connect",
      dtoValidationMiddleware(ConnectMilvusDto),
      this.connectMilvus.bind(this)
    );

    this.router.get("/check", this.checkConnect.bind(this));

    this.router.put(
      "/flush",
      dtoValidationMiddleware(FlushDto),
      this.flush.bind(this)
    );

    this.router.get("/metrics", this.getMetrics.bind(this));

    return this.router;
  }

  async connectMilvus(req: Request, res: Response, next: NextFunction) {
    const address = req.body?.address;
    console.log(address);
    try {
      const result = await this.milvusService.connectMilvus(address);
      console.log(result);

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async checkConnect(req: Request, res: Response, next: NextFunction) {
    const address = "" + req.query?.address;
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
}
