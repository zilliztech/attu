import { ReactElement } from 'react';
import { StatusEnum } from '../../components/status/Types';

export interface PartitionView {
  _id: string;
  _name: string;
  _status: StatusEnum;
  _statusElement?: ReactElement;
  _rowCount: string;
}
