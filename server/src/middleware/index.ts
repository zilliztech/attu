import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import chalk from 'chalk';
import { MILVUS_CLIENT_ID, HTTP_STATUS_CODE } from '../utils';
import { HttpError } from 'http-errors';
import HttpErrors from 'http-errors';
import { clientCache } from '../app';

declare global {
  namespace Express {
    interface Request {
      clientId?: string;
    }
  }
}

export const ReqHeaderMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // all ape requests need set milvus address in header.
  // server will set active address in milvus service.
  const milvusClientId = (req.headers[MILVUS_CLIENT_ID] as string) || '';
  req.clientId = req.headers[MILVUS_CLIENT_ID] as string;

  const bypassURLs = [`/api/v1/milvus/connect`, `/api/v1/milvus/version`];

  if (
    bypassURLs.indexOf(req.url) === -1 &&
    milvusClientId &&
    !clientCache.get(milvusClientId)
  ) {
    throw HttpErrors(
      HTTP_STATUS_CODE.FORBIDDEN,
      'Can not find your connection, please check your connection settings.'
    );
  }
  next();
};

export const TransformResMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const oldSend = res.json;
  res.json = data => {
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

/**
 * Handle error in here.
 * Normally depend on status which from milvus service.
 */
export const ErrorMiddleware = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  console.log(
    chalk.blue.bold(req.method, req.url),
    chalk.magenta.bold(statusCode),
    chalk.red.bold(err)
  );
  // Boolean property that indicates if the app sent HTTP headers for the response.
  // Here to prevent sending response after header has been sent.
  if (res.headersSent) {
    return next(err);
  }

  if (err) {
    res
      .status(statusCode)
      .json({ message: `${err}`, error: 'Bad Request', statusCode });
  }
  next();
};

export const LoggingMiddleware = morgan((tokens, req, res) => {
  return [
    '\n',
    chalk.blue.bold(tokens.method(req, res)),
    chalk.magenta.bold(tokens.status(req, res)),
    chalk.green.bold(tokens.url(req, res)),
    chalk.green.bold(tokens['response-time'](req, res) + ' ms'),
    chalk.green.bold('@ ' + tokens.date(req, res)),
    chalk.yellow(tokens['remote-addr'](req, res)),
    chalk.hex('#fffa65').bold('from ' + tokens.referrer(req, res)),
    chalk.hex('#1e90ff')(tokens['user-agent'](req, res)),
    '\n',
  ].join(' ');
});
