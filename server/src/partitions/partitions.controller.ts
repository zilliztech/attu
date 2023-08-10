import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { PartitionsService } from './partitions.service';
import { milvusService } from '../milvus';

import {
  GetPartitionsInfoDto,
  ManagePartitionDto,
  LoadPartitionsDto,
} from './dto';

export class PartitionController {
  private router: Router;
  private partitionsService: PartitionsService;

  constructor() {
    this.partitionsService = new PartitionsService(milvusService);
    this.router = Router();
  }

  generateRoutes() {
    this.router.get('/', this.getPartitionsInfo.bind(this));

    this.router.post(
      '/',
      dtoValidationMiddleware(ManagePartitionDto),
      this.managePartition.bind(this)
    );

    this.router.put(
      '/load',
      dtoValidationMiddleware(LoadPartitionsDto),
      this.loadPartition.bind(this)
    );

    this.router.put(
      '/release',
      dtoValidationMiddleware(LoadPartitionsDto),
      this.releasePartition.bind(this)
    );

    return this.router;
  }

  async getPartitionsInfo(req: Request, res: Response, next: NextFunction) {
    const collectionName = '' + req.query?.collection_name;
    try {
      const result = await this.partitionsService.getPartitionsInfo({
        collection_name: collectionName,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async managePartition(req: Request, res: Response, next: NextFunction) {
    const { type, ...params } = req.body;
    try {
      const result =
        type.toLocaleLowerCase() === 'create'
          ? await this.partitionsService.createPartition(params)
          : await this.partitionsService.deletePartition(params);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async loadPartition(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    try {
      const result = await this.partitionsService.loadPartitions(data);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async releasePartition(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    try {
      const result = await this.partitionsService.releasePartitions(data);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
