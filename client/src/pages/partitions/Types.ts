import { ReactElement } from 'react';
import { LOADING_STATE } from '@/consts';
import { ManageRequestMethods } from '../../types/Common';

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
