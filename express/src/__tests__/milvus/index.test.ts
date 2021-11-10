import express from 'express';
import http from 'http';
import supertest from 'supertest';
import { router as connectRouter } from '../../milvus/index';
import { TransformResInterceptor } from '../../interceptors';
import MilvusService from '../../__mocks__/milvus/milvus.service';

const mockAddress = '127.0.0.1';

// mock Milvus client service
jest.mock('../../__mocks__/milvus/milvus.service');

describe('Test Milvus Module', () => {
  let app: any;
  let server: any;
  let request: any;

  // setup app and server
  beforeAll((done) => {
    app = express();
    const router = express.Router();
    router.use('/milvus', connectRouter);
    app.use(TransformResInterceptor);
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
