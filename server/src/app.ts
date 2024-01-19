import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as http from 'http';
import { LRUCache } from 'lru-cache';
import * as path from 'path';
import chalk from 'chalk';
import { router as connectRouter } from './milvus';
import { router as collectionsRouter } from './collections';
import { router as databasesRouter } from './database';
import { router as partitionsRouter } from './partitions';
import { router as schemaRouter } from './schema';
import { router as cronsRouter } from './crons';
import { router as userRouter } from './users';
import { router as prometheusRouter } from './prometheus';
import {
  TransformResMiddleware,
  LoggingMiddleware,
  ErrorMiddleware,
  ReqHeaderMiddleware,
} from './middleware';
import { CLIENT_TTL } from './utils';
import { getIp } from './utils/Network';
import { DescribeIndexResponse, MilvusClient } from './types';
import { initWebSocket } from './socket';

// initialize express app
export const app = express();

// initialize cache store
export const clientCache = new LRUCache<
  string,
  {
    milvusClient: MilvusClient;
    address: string;
    indexCache: LRUCache<string, DescribeIndexResponse>;
  }
>({
  ttl: CLIENT_TTL,
  ttlAutopurge: true,
});

// initialize express router
const router = express.Router();
// define routers
router.use('/milvus', connectRouter);
router.use('/databases', databasesRouter);
router.use('/collections', collectionsRouter);
router.use('/partitions', partitionsRouter);
router.use('/schema', schemaRouter);
router.use('/crons', cronsRouter);
router.use('/users', userRouter);
router.use('/prometheus', prometheusRouter);
router.get('/healthy', (req, res, next) => {
  res.json({ status: 200 });
  next();
});

// initialize a simple http server
const server = http.createServer(app);
// default port 3000
const PORT = 3000;

// setup middlewares
// use cors https://expressjs.com/en/resources/middleware/cors.html
app.use(cors());
// use helmet https://github.com/helmetjs/helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
// limit json file size
app.use(express.json({ limit: '150MB' }));
// TransformResInterceptor
app.use(TransformResMiddleware);
// LoggingInterceptor
app.use(LoggingMiddleware);
// All headers operations
app.use(ReqHeaderMiddleware);
// use router
app.use('/api/v1', router);
// Return client build files
app.use(express.static('build'));

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, '../build/index.html'));
});
// ErrorInterceptor
app.use(ErrorMiddleware);
// init websocket server
initWebSocket(server);

// start server
server.listen(PORT, () => {
  const ips = getIp();
  ips.forEach(ip => {
    console.info(chalk.cyanBright(`Attu server started: http://${ip}:${PORT}`));
  });
});
