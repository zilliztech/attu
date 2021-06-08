import { Injectable } from '@nestjs/common';
import { MilvusService } from '../milvus/milvus.service';

@Injectable()
export class CollectionsService {
  constructor(private milvusService: MilvusService) {}

  showCollections() {
    return { address: this.milvusService.milvusAddressGetter };
  }
}
