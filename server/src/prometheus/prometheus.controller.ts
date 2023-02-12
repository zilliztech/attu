import { NextFunction, Request, Response, Router } from 'express';
import { PrometheusService } from './prometheus.service';

export class PrometheusController {
  private router: Router;
  private prometheusService: PrometheusService;

  constructor() {
    this.prometheusService = new PrometheusService();
    this.router = Router();
  }

  generateRoutes() {
    this.router.get('/setPrometheus', this.setPrometheus.bind(this));
    this.router.get(
      '/getMilvusHealthyData',
      this.getMilvusHealthyData.bind(this)
    );

    return this.router;
  }

  async setPrometheus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.prometheusService.setPrometheus(
        req.query as any
      );
      res.send(result);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  async getMilvusHealthyData(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.prometheusService.getMilvusHealthyData(
        req.query as any
      );
      res.send(result);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
}
