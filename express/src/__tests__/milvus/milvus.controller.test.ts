import express from 'express';
import http from 'http';
import supertest from 'supertest';
import { TransformResMiddlerware } from '../../middlewares';
import { router as connectRouter } from '../../milvus/index';
import { mockAddress } from '../__mocks__/consts';

import MilvusService from '../__mocks__/milvus/milvusService';

// mock Milvus client service
jest.mock('../__mocks__/milvus/milvusService');

describe('Test Milvus Module', () => {
  let app: any;
  let server: any;
  let request: any;

  // setup app and server
  beforeAll((done) => {
    app = express();
    const router = express.Router();
    router.use('/milvus', connectRouter);
    app.use(TransformResMiddlerware);
    app.use('/api/v1', router);
    server = http.createServer(app);
    server.listen(done);
    request = supertest(server);
  });

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    MilvusService.mockClear();
  });

  // close server
  afterAll((done) => {
    server.close(done);
  });

  test('check whether connected to Milvus with address', () => {
    // with address param
    request.get('/check').query({ address: mockAddress }).expect(200);
    // without address param
    request.get('/check').expect(404);
  });

  test('check request to connect to Milvus', () => {
    request
      .post('/connect')
      .send({ address: mockAddress })
      .set('Accept', 'application/json')
      .expect(200);
  });
});
