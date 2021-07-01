import { ReactElement } from 'react';
import { StatusEnum } from '../../components/status/Types';
import { ManageRequestMethods } from '../../types/Common';

export interface PartitionData {
  _id: string;
  _name: string;
  _status: StatusEnum;
  _rowCount: string;
  _formatName: string;
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

export interface PartitionCreateProps {
  handleCreate: (name: string) => void;
  handleClose: () => void;
}
