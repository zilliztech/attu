import {
  CreateIndexReq,
  DescribeIndexReq,
  DropIndexReq,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
import { clientCache } from '../app';
import { DescribeIndexRes } from '../types';
import { getKeyValueListFromJsonString, findKeyValue } from '../utils';

export class SchemaService {
  async createIndex(clientId: string, data: CreateIndexReq) {
    const { milvusClient, indexCache, database } = clientCache.get(clientId);
    const res = await milvusClient.createIndex(data);
    const key = `${database}/${data.collection_name}`;

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
  async describeIndex(clientId: string, data: DescribeIndexReq) {
    const { milvusClient, indexCache, database } = clientCache.get(clientId);

    // Get the collection name from the request data
    const key = `${database}/${data.collection_name}`;

    // Try to get the index description from the cache
    const value = indexCache.get(key);

    // If the index description is in the cache, return it
    if (value) {
      return value;
    } else {
      // If the index description is not in the cache, call the Milvus SDK's describeIndex function
      const res = (await milvusClient.describeIndex(data)) as DescribeIndexRes;

      res.index_descriptions.map(index => {
        // get indexType
        index.indexType = (index.params.find(p => p.key === 'index_type')
          ?.value || '') as string;
        // get metricType
        const metricTypePair =
          index.params.filter(v => v.key === 'metric_type') || [];
        index.metricType = findKeyValue(
          metricTypePair,
          'metric_type'
        ) as string;
        // get index parameter pairs
        const paramsJSONstring = findKeyValue(index.params, 'params'); // params is a json string
        const params =
          (paramsJSONstring &&
            getKeyValueListFromJsonString(paramsJSONstring as string)) ||
          [];
        index.indexParameterPairs = [...metricTypePair, ...params];
      });

      // Return the response from the Milvus SDK's describeIndex function
      return res;
    }
  }

  async dropIndex(clientId: string, data: DropIndexReq) {
    const { milvusClient, indexCache, database } = clientCache.get(clientId);

    const res = await milvusClient.dropIndex(data);
    const key = `${database}/${data.collection_name}`;

    // clear cache;
    indexCache.delete(key);
    throwErrorFromSDK(res);
    return res;
  }

  async clearCache(clientId: string) {
    const { indexCache } = clientCache.get(clientId);
    return indexCache.clear();
  }
}
