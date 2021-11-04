import express  from "express";
import cors from "cors";
import helmet from "helmet";
import * as http from "http";
import { Server, Socket } from "socket.io";
import { router as connectRouter } from "./connect";
import { router as collectionsRouter } from "./collections";
import { router as partitionsRouter } from "./partitions";
import { router as schemaRouter } from "./schema";
import { router as cronsRouter } from "./crons";
import { pubSub } from "./events";
import {
  TransformResInterceptor,
  LoggingInterceptor,
  ErrorInterceptor,
} from "./interceptors";
import { getDirectories, generateCfgs } from "./utils";

const PLUGIN_DEV = process.env?.PLUGIN_DEV;
const SRC_PLUGIN_DIR = "src/plugins";
const DEV_PLUGIN_DIR = "../../src/*/server";

const app = express();
const PORT = 3000;
// initialize a simple http server
const server = http.createServer(app);
// initialize the WebSocket server instance
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// https://expressjs.com/en/resources/middleware/cors.html
app.use(cors());
// https://github.com/helmetjs/helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json({ limit: "150MB" }));

// TransformResInterceptor
app.use(TransformResInterceptor);
// LoggingInterceptor
app.use(LoggingInterceptor);

const router = express.Router();
const pluginsRouter = express.Router();

// Init WebSocket server event listener
io.on("connection", (socket: Socket) => {
  console.log("socket.io connected");
  socket.on("COLLECTION", (message: any) => {
    socket.emit("COLLECTION", { data: message });
  });
  socket.on("events", (message: any) => {
    const response = [1, 2, 3];
    response.map((item) => {
      setImmediate(() => socket.emit("events", { data: item }));
    });
  });
  socket.on("identity", (message: any) => {
    socket.emit("identity", `identity data: ${message}`);
  });
  pubSub.on("ws_pubsub", (msg) => {
    const { event, data } = msg;
    socket.emit(event, data);
  });
});

// Read plugin files and start express server
// Import all plguins under "src/plugins"
getDirectories(SRC_PLUGIN_DIR, async (dirErr: Error, dirRes: [string]) => {
  const cfgs: any = [];
  if (dirErr) {
    console.log("Reading plugin directory Error", dirErr);
  } else {
    generateCfgs(cfgs, dirRes);
  }
  // If under plugin dev mode, import all plugins under "../../src/*/server"
  if (PLUGIN_DEV) {
    await getDirectories(
      DEV_PLUGIN_DIR,
      (devDirErr: Error, devDirRes: [string]) => {
        if (devDirErr) {
          console.log("Reading plugin directory Error", dirErr);
        } else {
          generateCfgs(cfgs, devDirRes, false);
        }
      }
    );
  }
  console.log(cfgs);
  cfgs.forEach(async (cfg: any) => {
    const { api: pluginPath, componentPath } = cfg;
    if (!pluginPath) return;
    const {
      default: { router: pluginRouter },
    } = await import(componentPath);
    pluginsRouter.use(`/${pluginPath}`, pluginRouter);
  });

  router.use("/milvus", connectRouter);
  router.use("/collections", collectionsRouter);
  router.use("/partitions", partitionsRouter);
  router.use("/schema", schemaRouter);
  router.use("/crons", cronsRouter);

  router.get("/healthy", (req, res, next) => {
    res.json({ status: 200 });
    next();
  });

  app.use("/api/v1", router);
  app.use("/api/plugins", pluginsRouter);

  // ErrorInterceptor
  app.use(ErrorInterceptor);
  // start server
  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT} :)`);
  });
});
