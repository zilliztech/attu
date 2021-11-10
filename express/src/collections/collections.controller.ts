import { NextFunction, Request, Response, Router } from "express";
import { dtoValidationMiddleware } from "../middlewares/validation";
import { milvusService } from "../milvus";
import { CollectionsService } from "./collections.service";
import {
  CreateAliasDto,
  CreateCollectionDto,
  InsertDataDto,
  ShowCollectionsDto,
  VectorSearchDto,
} from "./dto";

export class CollectionController {
  public collectionsService: CollectionsService;
  public router: Router;

  constructor() {
    this.collectionsService = new CollectionsService(milvusService);

    this.router = Router();
  }

  get collectionsServiceGetter() {
    return this.collectionsService;
  }

  generateRoutes() {
    /**
     * @swagger
     * /collections:
     *   get:
     *     description: Get all or loaded collection
     *     responses:
     *       200:
     *         Collections List
     */
    this.router.get(
      "/",
      dtoValidationMiddleware(ShowCollectionsDto),
      this.showCollections.bind(this)
    );

    this.router.post(
      "/",
      dtoValidationMiddleware(CreateCollectionDto),
      this.createCollection.bind(this)
    );

    this.router.get("/statistics", this.getStatistics.bind(this));

    this.router.get(
      "/:name/statistics",
      this.getCollectionStatistics.bind(this)
    );

    this.router.get(
      "/indexes/status",
      this.getCollectionsIndexStatus.bind(this)
    );

    this.router.delete("/:name", this.dropCollection.bind(this));

    this.router.get("/:name", this.describeCollection.bind(this));

    this.router.put("/:name/load", this.loadCollection.bind(this));

    this.router.put("/:name/release", this.releaseCollection.bind(this));

    this.router.put(
      "/:name/insert",
      dtoValidationMiddleware(InsertDataDto),
      this.insert.bind(this)
    );

    this.router.put(
      "/:name/search",
      dtoValidationMiddleware(VectorSearchDto),
      this.vectorSearch.bind(this)
    );

    this.router.post(
      "/:name/alias",
      dtoValidationMiddleware(CreateAliasDto),
      this.createAlias.bind(this)
    );

    return this.router;
  }

  async showCollections(req: Request, res: Response, next: NextFunction) {
    const type = parseInt("" + req.query?.type, 10);
    try {
      const result =
        type === 1
          ? await this.collectionsService.getLoadedColletions()
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
    const name = req.params?.name;
    try {
      const result = await this.collectionsService.loadCollection({
        collection_name: name,
      });
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
}
