import { ReactElement } from 'react';
import { LOADING_STATE } from '@/consts';
import { ManageRequestMethods } from '../../types/Common';

export interface PartitionData {
  id: string;
  name: string;
  status: LOADING_STATE;
  entityCount: string;
  partitionName: string;
}

export interface PartitionView extends PartitionData {
  _nameElement?: ReactElement;
  _statusElement?: ReactElement;
}

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
