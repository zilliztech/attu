import { Option } from '../../components/customSelector/Types';
import { EmbeddingTypeEnum, searchKeywordsType } from '../../consts/Milvus';
import { DataType, DataTypeEnum } from '../collections/Types';
import { IndexView } from '../schema/Types';

export interface SearchParamsProps {
  // if user created index, pass metric type choosed when creating
  // else pass empty string
  metricType: string;
  // used for getting metric type options
  embeddingType: EmbeddingTypeEnum;
  // default index type is FLAT
  indexType: string;
  // index extra params, e.g. nlist
  indexParams: { key: string; value: string }[];
  searchParamsForm: {
    [key in string]: number;
  };
  topK: number;
  handleFormChange: (form: { [key in string]: number }) => void;
  wrapperClass?: string;
  setParamsDisabled: (isDisabled: boolean) => void;
}

export interface SearchResultView {
  // dynamic field names
  [key: string]: string | number;
  rank: number;
  distance: number;
}

export interface FieldOption extends Option {
  fieldType: DataType;
  // used to get metric type, index type and index params for search params
  // if user doesn't create index, default value is null
  indexInfo: IndexView | null;
}

export interface SearchParamInputConfig {
  label: string;
  key: searchKeywordsType;
  min: number;
  max: number;
  isInt?: boolean;
  // no value: empty string
  value: number | string;
  handleChange: (value: number) => void;
}

export interface VectorSearchParam {
  expr?: string;
  search_params: { key: string; value: string | number }[];
  vectors: any;
  output_fields: string[];
  vector_type: number | DataTypeEnum;
}

export interface SearchResult {
  // dynamic field names
  [key: string]: string | number;
  score: number;
}
