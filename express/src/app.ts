import fs from "fs";
import path from "path";
import glob from "glob";
import express, { application } from "express";
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

const router = express.Router();

const getDirectories = (
  src: string,
  callback: (err: Error, res: [string]) => void
) => {
  glob(src + "/**/*", callback);
};

const cfgs: any = [];

// export const pubSub = new PubSub();

io.on("connection", (socket: Socket) => {
  console.log("socket.io connected");
  socket.emit("greeting-from-server", {
    greeting: "Hello Client",
  });
  socket.on("greeting-from-client", (message) => {
    console.log(message);
  });
  socket.on("COLLECTION", (message: any) => {
    console.log("received COLLECTION: %s", message);
    socket.emit("COLLECTION", { data: message });
  });
  socket.on("events", (message: any) => {
    console.log("received events: %s", message);
    const response = [1, 2, 3];
    response.map((item) => {
      setImmediate(() => socket.emit("events", { data: item }));
    });
  });
  socket.on("identity", (message: any) => {
    console.log("received identity: %s", message);
    socket.emit("identity", `identity data: ${message}`);
  });
  pubSub.on("ws_pubsub", (msg) => {
    const { event, data } = msg;
    console.log(`pubsub: ${event}`);
    socket.emit(event, data);
  });
});

// const customInterceptor = (request: any, response: any, next: any) => {
//   const oldSend = response.send;
//   response.send = (data: any) => {
//     // arguments[0] (or `data`) contains the response body
//     // arguments[0] = "modified : " + arguments[0];
//     console.log(data);
//     const newData = {...data, test: "customInterceptor"}
//     console.log(newData);
//     oldSend.call(response, newData);
//   };
//   next();
// };
// app.use(customInterceptor);

getDirectories("../../src", (err: Error, res: [string]) => {
  if (err) {
    console.log("Error", err);
  } else {
    res.forEach((item: string) => {
      console.log(item);
      // if (path.extname(item) === ".json") {
      if (item.endsWith("/config.json")) {
        const fileData = fs.readFileSync(item);
        const json = JSON.parse(fileData.toString());
        const cfg = {
          path: item,
          dir: item.split("/config.json").shift(),
          data: json,
        };
        // console.log(cfg);
        cfgs.push(cfg);
      }
    });
  }
  console.log(cfgs);
  cfgs.forEach(async (cfg: any) => {
    // const pluginPath = cfg.data.api;
    const {
      dir,
      data: { api: pluginPath },
    } = cfg;
    if (!pluginPath) return;
    // const pluginRouter = require(`${dir}/server/app`);
    const {
      default: { router: pluginRouter },
    } = await import(`../${dir}/server/app`);
    console.log(pluginPath);
    console.log(pluginRouter);
    app.use(`/${pluginPath}`, pluginRouter);
  });

  router.use("/milvus", connectRouter);
  router.use("/collections", collectionsRouter);
  router.use("/partitions", partitionsRouter);
  router.use("/schema", schemaRouter);
  router.use("/crons", cronsRouter);

  router.get("/healthy", (request, response) => {
    response.json({ status: 200 });
  });

  app.use("/api/v1", router);
  app.all("/socket.io/", (request, response) => {
    response.send("ok");
  });
  // app.listen(PORT, () => {
  //   console.log(`Example app listening at http://localhost:${PORT}`);
  // });
  // start server
  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT} :)`);
  });
});
