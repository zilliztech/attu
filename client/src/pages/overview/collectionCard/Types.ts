import { LOADING_STATE } from '../../../consts/Milvus';

export interface CollectionCardProps {
  data: CollectionData;
  handleRelease: (data: CollectionData) => void;
  wrapperClass?: string;
}

export interface CollectionData {
  _name: string;
  _status: LOADING_STATE;
  _id: string;
  _rowCount: string;
}
