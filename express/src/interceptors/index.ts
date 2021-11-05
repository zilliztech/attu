import { Request, Response, NextFunction, Errback } from "express";

// TransformResInterceptor
export const TransformResInterceptor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const oldSend = res.json;
  res.json = (data) => {
    // console.log(data); // do something with the data
    const statusCode = data?.statusCode;
    const message = data?.message;
    const error = data?.error;
    res.json = oldSend; // set function back to avoid the 'double-send'
    if (statusCode || message || error) {
      return res.json({ statusCode, message, error });
    }
    return res.json({ data, statusCode: 200 }); // just call as normal with data
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
    // TODO: Need some special log instead of console.log
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
  // Boolean property that indicates if the app sent HTTP headers for the response.
  // Here to prevent sending response after header has been sent.
  if (res.headersSent) {
    return next(err);
  }
  if (err) {
    res
      .status(500)
      .json({ message: `${err}`, error: "Bad Request", statusCode: 500 });
  }
  next();
};
