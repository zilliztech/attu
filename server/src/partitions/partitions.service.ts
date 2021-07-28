import { Injectable } from '@nestjs/common';
import { MilvusService } from '../milvus/milvus.service';
import {
  CreatePartitionReq,
  DropPartitionReq,
  GetPartitionStatisticsReq,
  LoadPartitionsReq,
  ReleasePartitionsReq,
  ShowPartitionsReq,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types'; // todo: need improve like export types in root file.
import { throwErrorFromSDK } from '../utils/Error';
import { findKeyValue } from '../utils/Helper';
import { ROW_COUNT } from '../utils/Const';

@Injectable()
export class PartitionsService {
  constructor(private milvusService: MilvusService) { }

  get milvusClient() {
    return this.milvusService.milvusClientGetter;
  }

  async getPatitionsInfo(data: ShowPartitionsReq) {
    const result = [];
    const res = await this.getPartitions(data);
    if (res.partition_names && res.partition_names.length) {
      for (const [index, name] of res.partition_names.entries()) {
        const statistics = await this.getPartitionStatistics({
          ...data,
          partition_name: name,
        });
        result.push({
          name,
          id: res.partitionIDs[index],
          rowCount: findKeyValue(statistics.stats, ROW_COUNT),
        });
      }
    }
    return result;
  }

  async getPartitions(data: ShowPartitionsReq) {
    const res = await this.milvusClient.showPartitions(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async createParition(data: CreatePartitionReq) {
    const res = await this.milvusClient.createPartition(data);
    throwErrorFromSDK(res);
    return res;
  }

  async deleteParition(data: DropPartitionReq) {
    const res = await this.milvusClient.dropPartition(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getPartitionStatistics(data: GetPartitionStatisticsReq) {
    const res = await this.milvusClient.getPartitionStatistics(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async loadPartitions(data: LoadPartitionsReq) {
    const res = await this.milvusClient.loadPartitions(data);
    throwErrorFromSDK(res);
    return res;
  }

  async releasePartitions(data: ReleasePartitionsReq) {
    const res = await this.milvusClient.releasePartitions(data);
    throwErrorFromSDK(res);
    return res;
  }
}
