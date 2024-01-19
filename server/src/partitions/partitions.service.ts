import {
  CreatePartitionReq,
  DropPartitionReq,
  GetPartitionStatisticsReq,
  LoadPartitionsReq,
  ReleasePartitionsReq,
  ShowPartitionsReq,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
import { findKeyValue } from '../utils/Helper';
import { ROW_COUNT } from '../utils';
import { clientCache } from '../app';

export class PartitionsService {
  async getPartitionsInfo(clientId: string, data: ShowPartitionsReq) {
    const result = [];
    const res = await this.getPartitions(clientId, data);
    if (res.partition_names && res.partition_names.length) {
      for (const [index, name] of res.partition_names.entries()) {
        const statistics = await this.getPartitionStatistics(clientId, {
          ...data,
          partition_name: name,
        });
        result.push({
          name,
          id: res.partitionIDs[index],
          rowCount: findKeyValue(statistics.stats, ROW_COUNT),
          createdTime: res.created_utc_timestamps[index],
        });
      }
    }
    return result;
  }

  async getPartitions(clientId: string, data: ShowPartitionsReq) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.showPartitions(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async createPartition(clientId: string, data: CreatePartitionReq) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createPartition(data);
    throwErrorFromSDK(res);
    return res;
  }

  async deletePartition(clientId: string, data: DropPartitionReq) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.dropPartition(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getPartitionStatistics(
    clientId: string,
    data: GetPartitionStatisticsReq
  ) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.getPartitionStatistics(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async loadPartitions(clientId: string, data: LoadPartitionsReq) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.loadPartitions(data);
    throwErrorFromSDK(res);
    return res;
  }

  async releasePartitions(clientId: string, data: ReleasePartitionsReq) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.releasePartitions(data);
    throwErrorFromSDK(res);
    return res;
  }
}
