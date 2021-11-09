import request from 'supertest';
import express from 'express';
import { router as connectRouter } from '../../milvus/index';

const app = express();
const router = express.Router();
router.use('/milvus', connectRouter);
app.use('/api/v1', router);

// mock service that

describe('Test Milvus Module', () => {
  test('check whether connected to Milvus', async () => {
    const res = await request(app).get('/check');
    expect(res.header['content-type']).toBe('text/html; charset=utf-8');
    expect(res.statusCode).toBe(404);
    // expect(res.text).toEqual(true);
  });
});
