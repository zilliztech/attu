import { Request, Response, NextFunction, Errback } from 'express';
import morgan from 'morgan';
import chalk from 'chalk';
import { MilvusService } from '../milvus/milvus.service';

const MILVUS_ADDRESS = 'milvus_address';

export const ReqHeaderMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // all request need set milvus address in header.
  // server will set activeaddress in milvus service.
  const milvusAddress = req.headers[MILVUS_ADDRESS] || '';
  MilvusService.activeAddress = milvusAddress as string;
  next();
};

export const TransformResMiddlerware = (
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

/**
 * Handle error in here.
 * Normally depend on status which from milvus service.
 */
export const ErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(chalk.blue.bold(req.method, req.url), chalk.red.bold(err));
  // Boolean property that indicates if the app sent HTTP headers for the response.
  // Here to prevent sending response after header has been sent.
  if (res.headersSent) {
    return next(err);
  }
  if (err) {
    res
      .status(500)
      .json({ message: `${err}`, error: 'Bad Request', statusCode: 500 });
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
