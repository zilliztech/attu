import { PrometheusController } from './prometheus.controller';

const prometheusManager = new PrometheusController();
const router = prometheusManager.generateRoutes();

export { router };
