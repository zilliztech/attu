import { StatusEnum } from '../../../components/status/Types';

export interface CollectionCardProps {
  data: CollectionData;
  wrapperClass?: string;
}

export interface CollectionData {
  name: string;
  status: StatusEnum;
  id: string;
  rowCount: number;
}
