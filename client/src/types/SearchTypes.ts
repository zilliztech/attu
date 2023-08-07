import { Option } from '@/components/customSelector/Types';
import { searchKeywordsType } from '@/consts';
import { DataTypeEnum, DataTypeStringEnum } from '@/pages/collections/Types';
import { IndexView } from '@/pages/schema/Types';

export interface SearchParamsProps {
  // if user created index, pass metric type choosed when creating
  // else pass empty string
  metricType: string;
  // used for getting metric type options
  embeddingType: DataTypeEnum.FloatVector | DataTypeEnum.BinaryVector;
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
  fieldType: DataTypeStringEnum;
  // used to get metric type, index type and index params for search params
  // if user doesn't create index, default value is null
  indexInfo: IndexView | null;
  // used for check vector input validation
  dimension: number;
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
  className?: string;
}

export interface VectorSearchParam {
  expr?: string;
  search_params: {
    anns_field: string; // your vector field name
    topk: string | number;
    metric_type: string;
    params: string;
  };
  vectors: any;
  output_fields: string[];
  vector_type: DataTypeEnum;
}

export interface SearchResult {
  // dynamic field names
  [key: string]: string | number;
  score: number;
}
