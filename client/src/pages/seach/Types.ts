import { Option } from '../../components/customSelector/Types';
import { EmbeddingTypeEnum } from '../../consts/Milvus';
import { DataType } from '../collections/Types';

export interface SearchParamsProps {
  // if user created index, pass metric type choosed when creating
  // else pass empty string
  metricType: string;
  // used for getting metric type options
  embeddingType: EmbeddingTypeEnum;
  // default index type is FLAT
  indexType: string;
  searchParamsForm: {
    [key in string]: number;
  };
  handleFormChange: (form: { [key in string]: number }) => void;
  wrapperClass?: string;
}

export interface SearchResultView {
  // dynamic field names
  [key: string]: string | number;
  _rank: number;
  _distance: number;
}

export interface FieldOption extends Option {
  fieldType: DataType;
  // if user doesn't create index, use empty string as metric type
  metricType: string;
  indexType: string;
}
