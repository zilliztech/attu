import {
  CreatePartitionReq,
  DropPartitionReq,
  GetPartitionStatisticsReq,
  LoadPartitionsReq,
  ReleasePartitionsReq,
  ShowPartitionsReq,
  GetLoadStateReq,
  LoadState,
} from '@zilliz/milvus2-sdk-node';
import { findKeyValue } from '../utils';
import { ROW_COUNT } from '../utils';
import { clientCache } from '../app';
import { PartitionData } from '../types';

export class PartitionsService {
  async getPartitionsInfo(
    clientId: string,
    data: ShowPartitionsReq
  ): Promise<PartitionData[]> {
    const result = [];
    const res = await this.getPartitions(clientId, data);
    if (res.partition_names && res.partition_names.length) {
      for (const [index, name] of res.partition_names.entries()) {
        const statistics = await this.getPartitionStatistics(clientId, {
          ...data,
          partition_name: name,
        });

        const { status, loadedPercentage } = await this.getPartitionLoadState(
          clientId,
          data.collection_name,
          name
        );

        result.push({
          name,
          id: res.partitionIDs[index],
          rowCount: findKeyValue(statistics.stats, ROW_COUNT),
          createdTime: res.created_utc_timestamps[index],
          status,
          loadedPercentage,
        });
      }
    }
    return result;
  }

  async getPartitions(clientId: string, data: ShowPartitionsReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.showPartitions(data);
    return res;
  }

  async createPartition(clientId: string, data: CreatePartitionReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createPartition(data);
    return res;
  }

  async deletePartition(clientId: string, data: DropPartitionReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.dropPartition(data);
    return res;
  }

  async getPartitionStatistics(
    clientId: string,
    data: GetPartitionStatisticsReq
  ) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.getPartitionStatistics(data);
    return res;
  }

  async loadPartitions(clientId: string, data: LoadPartitionsReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.loadPartitions(data);
    return res;
  }

  async releasePartitions(clientId: string, data: ReleasePartitionsReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.releasePartitions(data);
    return res;
  }

  async getLoadState(clientId: string, data: GetLoadStateReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getLoadState(data);
    return res;
  }

  // 提取的获取分区加载状态方法
  async getPartitionLoadState(
    clientId: string,
    collectionName: string,
    partitionName: string
  ): Promise<{ status: 'loaded' | 'loading' | 'unloaded'; loadedPercentage: number }> {
    let status: 'loaded' | 'loading' | 'unloaded' = 'unloaded';
    let loadedPercentage = 0;

    try {
      const loadStateRes = await this.getLoadState(clientId, {
        collection_name: collectionName,
        partition_names: [partitionName],
      });

      if (loadStateRes.state === LoadState.LoadStateLoaded) {
        status = 'loaded';
        loadedPercentage = 100;
      } else if (loadStateRes.state === LoadState.LoadStateLoading) {
        status = 'loading';
        loadedPercentage = 50;
      }
    } catch (error) {
      console.log('Failed to get partition load state:', error);
    }

    return { status, loadedPercentage };
  }
}
