import {
  CreateIndexReq,
  DescribeIndexReq,
  DropIndexReq,
  DescribeIndexResponse,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
import { MilvusService } from '../milvus/milvus.service';
import { indexCache } from '../app';

export class SchemaService {
  constructor(private milvusService: MilvusService) {}

  async createIndex(data: CreateIndexReq) {
    const res = await this.milvusService.client.createIndex(data);
    const key = data.collection_name;

    // clear cache;
    indexCache.delete(key);
    throwErrorFromSDK(res);
    return res;
  }

  /**
   * This function is used to describe an index in Milvus.
   * It first checks if the index description is cached, if so, it returns the cached value.
   * If not, it calls the Milvus SDK's describeIndex function to get the index description.
   * If the index is finished building, it caches the index description for future use.
   * If the index is not finished building, it deletes any cached value for this index.
   * @param data - The request data for describing an index. It contains the collection name.
   * @returns - The response from the Milvus SDK's describeIndex function or the cached index description.
   */
  async describeIndex(data: DescribeIndexReq) {
    // Get the collection name from the request data
    const key = data.collection_name;

    // Try to get the index description from the cache
    let value: DescribeIndexResponse = indexCache.get(key);

    // If the index description is in the cache, return it
    if (value) {
      return value;
    } else {
      // If the index description is not in the cache, call the Milvus SDK's describeIndex function
      const res = await this.milvusService.client.describeIndex(data);

      // If the index is finished building and there is at least one index description,
      // cache the index description for future use
      if (
        res.index_descriptions?.length > 0 &&
        res.index_descriptions.every(i => i.state === 'Finished')
      ) {
        indexCache.set(key, res);
      } else {
        // If the index is not finished building, delete any cached value for this index
        indexCache.delete(key);
      }

      // Return the response from the Milvus SDK's describeIndex function
      return res;
    }
  }

  async dropIndex(data: DropIndexReq) {
    const res = await this.milvusService.client.dropIndex(data);
    const key = data.collection_name;

    // clear cache;
    indexCache.delete(key);
    throwErrorFromSDK(res);
    return res;
  }

  async clearCache() {
    return indexCache.clear();
  }
}
