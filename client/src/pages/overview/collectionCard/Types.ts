import { StatusEnum } from '../../../components/status/Types';

export interface CollectionCardProps {
  data: CollectionData;
  handleRelease: (data: CollectionData) => void;
  wrapperClass?: string;
}

export interface CollectionData {
  _name: string;
  _status: StatusEnum;
  _id: string;
  _rowCount: string;
}
