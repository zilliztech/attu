import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as http from 'http';
import { Server, Socket } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import LruCache from 'lru-cache';
import * as path from 'path';
import chalk from 'chalk';
import { router as connectRouter } from './milvus';
import { router as collectionsRouter } from './collections';
import { router as partitionsRouter } from './partitions';
import { router as schemaRouter } from './schema';
import { router as cronsRouter } from './crons';
import { router as userRouter } from './users';
import { pubSub } from './events';
import {
  TransformResMiddlerware,
  LoggingMiddleware,
  ErrorMiddleware,
  ReqHeaderMiddleware,
} from './middlewares';
import { surveSwaggerSpecification } from './swagger';
import { EXPIRED_TIME, INSIGHT_CACHE } from './utils/Const';
import { getIp } from './utils/Network';
// initialize express app
export const app = express();

// initialize cache store
const insightCache = new LruCache({
  maxAge: EXPIRED_TIME,
  updateAgeOnGet: true,
});

// initialize express router
const router = express.Router();
// define routers
router.use('/milvus', connectRouter);
router.use('/collections', collectionsRouter);
router.use('/partitions', partitionsRouter);
router.use('/schema', schemaRouter);
router.use('/crons', cronsRouter);
router.use('/users', userRouter);
router.get('/healthy', (req, res, next) => {
  res.json({ status: 200 });
  next();
});

// initialize a simple http server
const server = http.createServer(app);
// default port 3000
const PORT = 3000;
// swagger
const swaggerSpecs = surveSwaggerSpecification();

// setup middlewares
// use cache
app.set(INSIGHT_CACHE, insightCache);
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
app.use(TransformResMiddlerware);
// LoggingInterceptor
app.use(LoggingMiddleware);
// All headers operations
app.use(ReqHeaderMiddleware);
// use router
app.use('/api/v1', router);
// Return client build files
app.use(express.static('build'));
// use swagger
app.use('/api/v1/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, '../build/index.html'));
});
// ErrorInterceptor
app.use(ErrorMiddleware);

// start server
server.listen(PORT, () => {
  // initialize the WebSocket server instance
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Init WebSocket server event listener
  io.on('connection', (socket: Socket) => {
    console.info(
      chalk.green(`ws client connected ${socket.client.conn.remoteAddress}`)
    );
    socket.on('COLLECTION', (message: any) => {
      socket.emit('COLLECTION', { data: message });
    });
    pubSub.on('ws_pubsub', (msg: any) => {
      socket.emit(msg.event, msg.data);
    });
    io.on('disconnect', () => {
      console.info('ws disconnected');
    });
  });

  server.on('disconnect', () => {
    io.removeAllListeners();
  });

  const ips = getIp();
  ips.forEach(ip => {
    console.info(
      chalk.cyanBright(`Attu server started: http://${ip}:${PORT}/api/v1/swagger/`)
    );
  });
});
