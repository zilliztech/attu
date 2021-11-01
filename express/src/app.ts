import fs from "fs";
import path from "path";
import glob from "glob";
import express, {
  application,
  Request,
  Response,
  NextFunction,
  Errback,
} from "express";
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

const PLUGIN_DEV = process.env?.PLUGIN_DEV;
const pluginDir = PLUGIN_DEV ? "../../src/*/server" : "src/plugins";

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
  // socket.emit("greeting-from-server", {
  //   greeting: "Hello Client",
  // });
  // socket.on("greeting-from-client", (message) => {
  //   console.log(message);
  // });
  socket.on("COLLECTION", (message: any) => {
    // console.log("received COLLECTION: %s", message);
    socket.emit("COLLECTION", { data: message });
  });
  socket.on("events", (message: any) => {
    // console.log("received events: %s", message);
    const response = [1, 2, 3];
    response.map((item) => {
      setImmediate(() => socket.emit("events", { data: item }));
    });
  });
  socket.on("identity", (message: any) => {
    // console.log("received identity: %s", message);
    socket.emit("identity", `identity data: ${message}`);
  });
  pubSub.on("ws_pubsub", (msg) => {
    const { event, data } = msg;
    // console.log(`pubsub: ${event}`);
    socket.emit(event, data);
  });
});

// Utils: read files under specified directories
const getDirectories = (
  src: string,
  callback: (err: Error, res: [string]) => void
) => {
  glob(src + "/**/*", callback);
};

// Read plugin files and start express server
getDirectories(pluginDir, (dirErr: Error, dirRes: [string]) => {
  const cfgs: any = [];
  if (dirErr) {
    console.log("Reading plugin directory Error", dirErr);
  } else {
    dirRes.forEach((item: string) => {
      if (item.endsWith("/config.json")) {
        const fileData = fs.readFileSync(item);
        const jsonData = JSON.parse(fileData.toString());
        const apiPath = jsonData?.server?.api;
        const cfg = {
          path: item,
          dir: item.split("/config.json").shift(),
          dirName: item.split("/config.json").shift().split("/").pop(),
          api: apiPath,
          data: jsonData,
        };
        cfgs.push(cfg);
      }
    });
  }
  console.log(cfgs);
  cfgs.forEach(async (cfg: any) => {
    const {
      dir,
      dirName,
      api: pluginPath,
    } = cfg;
    if (!pluginPath) return;
    const componentPath = PLUGIN_DEV ? `../${dir}/app` : `./plugins/${dirName}/app`;
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
