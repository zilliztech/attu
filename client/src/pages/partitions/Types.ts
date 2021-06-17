import { ReactElement } from 'react';
import { StatusEnum } from '../../components/status/Types';

export interface PartitionView {
  id: string;
  name: string;
  status: StatusEnum;
  statusElement: ReactElement;
  rowCount: string;
}
