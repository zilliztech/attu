import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as http from 'http';
import { Server, Socket } from 'socket.io';
import LruCache from 'lru-cache';
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
import { pubSub } from './events';
import {
  TransformResMiddleware,
  LoggingMiddleware,
  ErrorMiddleware,
  ReqHeaderMiddleware,
} from './middleware';
import { EXPIRED_TIME, CACHE_KEY } from './utils';
import { getIp } from './utils/Network';
// initialize express app
export const app = express();

// initialize cache store
const cache = new LruCache({
  maxAge: EXPIRED_TIME,
  updateAgeOnGet: true,
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
// use cache
app.set(CACHE_KEY, cache);
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
    socket.on('disconnect', () => {
      console.info(
        chalk.green(
          `ws client disconnected ${socket.client.conn.remoteAddress}`
        )
      );
    });
  });

  server.on('disconnect', (socket: Socket) => {
    io.removeAllListeners();
  });

  const ips = getIp();
  ips.forEach(ip => {
    console.info(chalk.cyanBright(`Attu server started: http://${ip}:${PORT}`));
  });
});
