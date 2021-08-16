import { MilvusService } from './milvus.service';

class MilvusServiceMock {
  milvusClientGetter() {
    return {};
  }
}

export const MilvusServiceProvider = {
  provide: MilvusService,
  useClass: MilvusServiceMock,
};

