import { Request, Response, NextFunction, Errback } from "express";

// TransformResInterceptor
export const TransformResInterceptor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const oldSend = res.send;
  res.send = (data) => {
    // console.log(data); // do something with the data
    res.send = oldSend; // set function back to avoid the 'double-send'
    return res.send({ data });
    // return res.send({ data, statusCode: 200 }); // just call as normal with data
  };
  next();
};

const getDurationInMilliseconds = (start: any) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

/**
 * Add spent time looger when accessing milvus.
 */
export const LoggingInterceptor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`${req.method} ${req.originalUrl} [STARTED]`);
  const start = process.hrtime();
  const { ip = "", method = "", originalUrl = "", headers = {} } = req;
  const ua = headers["user-agent"] || "";

  res.on("finish", () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    console.log(
      `${req.method} ${
        req.originalUrl
      } [FINISHED] ${durationInMilliseconds.toLocaleString()} ms`
    );
  });

  res.on("close", () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    const { statusCode = "" } = res;
    console.log(
      `${req.method} ${
        req.originalUrl
      } [CLOSED] ${durationInMilliseconds.toLocaleString()} ms ip:${ip} ua:${ua} status:${statusCode}`
    );
  });

  next();
};

/**
 * Handle error in here.
 * Normally depend on status which from milvus service.
 */
export const ErrorInterceptor = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("---error interceptor---\n%s", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
};
