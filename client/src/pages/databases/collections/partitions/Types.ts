import { ManageRequestMethods } from '@/consts';

// delete and create
export interface PartitionManageParam {
  collectionName: string;
  partitionName: string;
  type: ManageRequestMethods;
}

// load and release
export interface PartitionParam {
  collectionName: string;
  partitionNames: string[];
}
