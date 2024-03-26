import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { CollectionsService } from './collections.service';
import { LoadCollectionReq } from '@zilliz/milvus2-sdk-node';
import {
  CreateAliasDto,
  CreateCollectionDto,
  InsertDataDto,
  ImportSampleDto,
  VectorSearchDto,
  QueryDto,
  RenameCollectionDto,
  DuplicateCollectionDto,
  ManageIndexDto,
} from './dto';

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
    // get all collections
    this.router.get('/', this.showCollections.bind(this));
    // get all collections statistics
    this.router.get('/statistics', this.getStatistics.bind(this));
    // index
    this.router.post(
      '/index',
      dtoValidationMiddleware(ManageIndexDto),
      this.manageIndex.bind(this)
    );

    this.router.get('/index', this.describeIndex.bind(this));
    this.router.post('/index/flush', this.clearCache.bind(this));

    // get collection with index info
    this.router.get('/:name', this.describeCollection.bind(this));
    // get count
    this.router.get('/:name/count', this.count.bind(this));
    // create collection
    this.router.post(
      '/',
      dtoValidationMiddleware(CreateCollectionDto),
      this.createCollection.bind(this)
    );
    // drop collection
    this.router.delete('/:name', this.dropCollection.bind(this));
    // rename collection
    this.router.post(
      '/:name',
      dtoValidationMiddleware(RenameCollectionDto),
      this.renameCollection.bind(this)
    );
    // duplicate collection
    this.router.post(
      '/:name/duplicate',
      dtoValidationMiddleware(DuplicateCollectionDto),
      this.duplicateCollection.bind(this)
    );

    // get collection statistics
    this.router.get(
      '/:name/statistics',
      this.getCollectionStatistics.bind(this)
    );

    // load / release
    this.router.put('/:name/load', this.loadCollection.bind(this));
    this.router.put('/:name/release', this.releaseCollection.bind(this));
    this.router.put('/:name/empty', this.empty.bind(this));

    // insert data
    this.router.post(
      '/:name/insert',
      dtoValidationMiddleware(InsertDataDto),
      this.insert.bind(this)
    );

    // insert sample data
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
    // query
    this.router.post(
      '/:name/query',
      dtoValidationMiddleware(QueryDto),
      this.query.bind(this)
    );
    // create alias
    this.router.post(
      '/:name/alias',
      dtoValidationMiddleware(CreateAliasDto),
      this.createAlias.bind(this)
    );
    // drop alias
    this.router.delete('/:name/alias/:alias', this.dropAlias.bind(this));

    // segments
    this.router.get('/:name/psegments', this.getPSegment.bind(this));
    this.router.get('/:name/qsegments', this.getQSegment.bind(this));
    // compact
    this.router.put('/:name/compact', this.compact.bind(this));

    return this.router;
  }

  async showCollections(req: Request, res: Response, next: NextFunction) {
    const type = parseInt('' + req.query?.type, 10);
    try {
      const result =
        type === 1
          ? await this.collectionsService.getLoadedCollections(req.clientId)
          : await this.collectionsService.getAllCollections(req.clientId);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.collectionsService.getStatistics(req.clientId);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async createCollection(req: Request, res: Response, next: NextFunction) {
    const createCollectionData = req.body;
    try {
      const result = await this.collectionsService.createCollection(
        req.clientId,
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
      const result = await this.collectionsService.renameCollection(
        req.clientId,
        {
          collection_name: name,
          ...data,
        }
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async duplicateCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.duplicateCollection(
        req.clientId,
        {
          collection_name: name,
          ...data,
        }
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async dropCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.dropCollection(
        req.clientId,
        {
          collection_name: name,
        }
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async describeCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.getAllCollections(
        req.clientId,
        [name]
      );
      res.send(result[0]);
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
      const result = await this.collectionsService.getCollectionStatistics(
        req.clientId,
        {
          collection_name: name,
        }
      );
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
      const result = await this.collectionsService.loadCollection(
        req.clientId,
        param
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async releaseCollection(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.releaseCollection(
        req.clientId,
        {
          collection_name: name,
        }
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async insert(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.insert(req.clientId, {
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
      const result = await this.collectionsService.importSample(req.clientId, {
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
      const result = await this.collectionsService.deleteEntities(
        req.clientId,
        {
          collection_name: name,
          ...data,
        }
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async vectorSearch(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.vectorSearch(req.clientId, {
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
      const limit = parseInt(resultLimit, 10);
      const page = isNaN(resultPage) ? 0 : parseInt(resultPage, 10);
      const result = await this.collectionsService.query(req.clientId, {
        collection_name: name,
        ...data,
      });

      // const queryResultList = result.data;
      const queryResultLength = result.data.length;
      res.send({ ...result, limit, page, total: queryResultLength });
    } catch (error) {
      next(error);
    }
  }

  async createAlias(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    const data = req.body;
    try {
      const result = await this.collectionsService.createAlias(req.clientId, {
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
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.dropAlias(
        req.clientId,
        name,
        {
          alias,
        }
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getReplicas(req: Request, res: Response, next: NextFunction) {
    const collectionID = req.params?.collectionID;
    try {
      const result = await this.collectionsService.getReplicas(req.clientId, {
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
      const result = await this.collectionsService.getPersistentSegmentInfo(
        req.clientId,
        {
          collectionName: name,
        }
      );
      res.send(result.infos);
    } catch (error) {
      next(error);
    }
  }

  async getQSegment(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.getQuerySegmentInfo(
        req.clientId,
        {
          collectionName: name,
        }
      );
      res.send(result.infos);
    } catch (error) {
      next(error);
    }
  }

  async compact(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.compact(req.clientId, {
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
      const result = await this.collectionsService.count(req.clientId, {
        collection_name: name,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async empty(req: Request, res: Response, next: NextFunction) {
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.emptyCollection(
        req.clientId,
        {
          collection_name: name,
        }
      );

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async manageIndex(req: Request, res: Response, next: NextFunction) {
    const { type, collection_name, index_name, extra_params, field_name } =
      req.body;
    try {
      const result =
        type.toLocaleLowerCase() === 'create'
          ? await this.collectionsService.createIndex(req.clientId, {
              collection_name,
              extra_params,
              field_name,
              index_name,
            })
          : await this.collectionsService.dropIndex(req.clientId, {
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
      const result = await this.collectionsService.describeIndex(req.clientId, {
        collection_name: data,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async clearCache(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.collectionsService.clearCache(req.clientId);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
