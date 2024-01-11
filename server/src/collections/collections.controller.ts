import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { CollectionsService } from './collections.service';
import {
  CreateAliasDto,
  CreateCollectionDto,
  InsertDataDto,
  ImportSampleDto,
  VectorSearchDto,
  QueryDto,
  RenameCollectionDto,
  DuplicateCollectionDto,
} from './dto';
import { LoadCollectionReq } from '@zilliz/milvus2-sdk-node';

export class CollectionController {
  private collectionsService: CollectionsService;
  private router: Router;

  constructor() {
    this.collectionsService = new CollectionsService();

    this.router = Router();
  }

  get collectionsServiceGetter() {
    return this.collectionsService;
  }

  generateRoutes() {
    this.router.get('/', this.showCollections.bind(this));
    this.router.post(
      '/',
      dtoValidationMiddleware(CreateCollectionDto),
      this.createCollection.bind(this)
    );
    this.router.get('/statistics', this.getStatistics.bind(this));
    this.router.get(
      '/:name/statistics',
      this.getCollectionStatistics.bind(this)
    );
    this.router.get(
      '/indexes/status',
      this.getCollectionsIndexStatus.bind(this)
    );
    this.router.delete('/:name', this.dropCollection.bind(this));
    this.router.post(
      '/:name',
      dtoValidationMiddleware(RenameCollectionDto),
      this.renameCollection.bind(this)
    );
    this.router.post(
      '/:name/duplicate',
      dtoValidationMiddleware(DuplicateCollectionDto),
      this.duplicateCollection.bind(this)
    );
    this.router.delete('/:name/alias/:alias', this.dropAlias.bind(this));
    // collection with index info
    this.router.get('/:name', this.describeCollection.bind(this));
    // just collection info
    this.router.get('/:name/info', this.getCollectionInfo.bind(this));
    this.router.get('/:name/count', this.count.bind(this));

    // load / release
    this.router.put('/:name/load', this.loadCollection.bind(this));
    this.router.put('/:name/release', this.releaseCollection.bind(this));
    this.router.post(
      '/:name/insert',
      dtoValidationMiddleware(InsertDataDto),
      this.insert.bind(this)
    );
    this.router.post(
      '/:name/importSample',
      dtoValidationMiddleware(ImportSampleDto),
      this.importSample.bind(this)
    );
    // we need use req.body, so we can't use delete here
    this.router.put('/:name/entities', this.deleteEntities.bind(this));
    this.router.post(
      '/:name/search',
      dtoValidationMiddleware(VectorSearchDto),
      this.vectorSearch.bind(this)
    );
    this.router.post(
      '/:name/query',
      dtoValidationMiddleware(QueryDto),
      this.query.bind(this)
    );
    this.router.post(
      '/:name/alias',
      dtoValidationMiddleware(CreateAliasDto),
      this.createAlias.bind(this)
    );

    // segments
    this.router.get('/:name/psegments', this.getPSegment.bind(this));
    this.router.get('/:name/qsegments', this.getQSegment.bind(this));

    this.router.put('/:name/compact', this.compact.bind(this));
    return this.router;
  }

  async showCollections(req: Request, res: Response, next: NextFunction) {
    const type = parseInt('' + req.query?.type, 10);
    try {
      const result =
        type === 1
          ? await this.collectionsService.getLoadedCollections()
          : await this.collectionsService.getAllCollections();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.collectionsService.getStatistics();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async createCollection(req: Request, res: Response, next: NextFunction) {
    const createCollectionData = req.body;
    try {
      const result = await this.collectionsService.createCollection(
        createCollectionData
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async renameCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.renameCollection({
        collection_name: name,
        ...data,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async duplicateCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.duplicateCollection({
        collection_name: name,
        ...data,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async dropCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.dropCollection({
        collection_name: name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async describeCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.getAllCollections({
        data: [{ name }],
      });
      res.send(result[0]);
    } catch (error) {
      next(error);
    }
  }

  async getCollectionInfo(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.describeCollection({
        collection_name: name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getCollectionStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.getCollectionStatistics({
        collection_name: name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getCollectionsIndexStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.collectionsService.getCollectionsIndexStatus();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async loadCollection(req: Request, res: Response, next: NextFunction) {
    const collection_name = req.params?.name;
    const data = req.body;
    const param: LoadCollectionReq = { collection_name };
    if (data.replica_number) {
      param.replica_number = Number(data.replica_number);
    }
    try {
      const result = await this.collectionsService.loadCollection(param);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async releaseCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.releaseCollection({
        collection_name: name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async insert(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.insert({
        collection_name: name,
        ...data,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async importSample(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    try {
      const result = await this.collectionsService.importSample({
        ...data,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  async deleteEntities(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.deleteEntities({
        collection_name: name,
        ...data,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async vectorSearch(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.vectorSearch({
        collection_name: name,
        ...data,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async query(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    const resultLimit: any = req.query?.limit;
    const resultPage: any = req.query?.page;

    try {
      const limit = isNaN(resultLimit) ? 100 : parseInt(resultLimit, 10);
      const page = isNaN(resultPage) ? 0 : parseInt(resultPage, 10);
      // TODO: add page and limit to node SDK
      // Here may raise "Error: 8 RESOURCE_EXHAUSTED: Received message larger than max"
      const result = await this.collectionsService.query({
        collection_name: name,
        ...data,
      });

      // const queryResultList = result.data;
      const queryResultLength = result.data.length;
      // const startNum = page * limit;
      // const endNum = (page + 1) * limit;
      // const slicedResult = queryResultList.slice(startNum, endNum);
      // result.data = slicedResult;
      res.send({ ...result, limit, page, total: queryResultLength });
    } catch (error) {
      next(error);
    }
  }

  async createAlias(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.createAlias({
        collection_name: name,
        ...data,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async dropAlias(req: Request, res: Response, next: NextFunction) {
    const alias = req.params?.alias;
    try {
      const result = await this.collectionsService.dropAlias({ alias });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getReplicas(req: Request, res: Response, next: NextFunction) {
    const collectionID = req.params?.collectionID;
    try {
      const result = await this.collectionsService.getReplicas({
        collectionID,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getPSegment(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.getPersistentSegmentInfo({
        collectionName: name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getQSegment(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.getQuerySegmentInfo({
        collectionName: name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async compact(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.compact({
        collection_name: name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async count(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const { value } = await this.collectionsService.hasCollection({
        collection_name: name,
      });
      let result: any = '';
      if (value) {
        result = await this.collectionsService.count({
          collection_name: name,
        });
      }

      res.send({ collection_name: name, rowCount: result });
    } catch (error) {
      next(error);
    }
  }
}
