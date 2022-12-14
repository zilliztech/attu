import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as http from 'http';
import { Server, Socket } from 'socket.io';
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

// import { getDirectories, getDirectoriesSync, generateCfgs } from './utils';
import * as path from 'path';
import chalk from 'chalk';
import { surveSwaggerSpecification } from './swagger';
import swaggerUi from 'swagger-ui-express';
import LruCache from 'lru-cache';
import { EXPIRED_TIME, INSIGHT_CACHE } from './utils/Const';

const insightCache = new LruCache({
  maxAge: EXPIRED_TIME,
  updateAgeOnGet: true,
});

export const app = express();
const PORT = 3000;
// initialize a simple http server
const server = http.createServer(app);

app.set(INSIGHT_CACHE, insightCache);
// https://expressjs.com/en/resources/middleware/cors.html
app.use(cors());
// https://github.com/helmetjs/helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json({ limit: '150MB' }));
// TransformResInterceptor
app.use(TransformResMiddlerware);
// LoggingInterceptor
app.use(LoggingMiddleware);

// All headers operations
app.use(ReqHeaderMiddleware);

const router = express.Router();
const pluginsRouter = express.Router();

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

app.use('/api/v1', router);
app.use('/api/plugins', pluginsRouter);

// Return client build files
app.use(express.static('build'));

const data = surveSwaggerSpecification();
app.use('/api/v1/swagger', swaggerUi.serve, swaggerUi.setup(data));

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
    console.info('ws connected');
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
  console.info(chalk.green.bold(`Attu Server started on port ${PORT} :)`));
});
