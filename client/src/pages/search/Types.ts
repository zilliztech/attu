import { Option } from '@/components/customSelector/Types';
import { searchKeywordsType } from '@/consts';
import { DataTypeEnum } from '@/consts';
import { FieldObject, KeyValuePair } from '@server/types';

export interface SearchParamsProps {
  // default index type is FLAT
  indexType?: string;
  // index extra params, e.g. nlist
  indexParams?: KeyValuePair[];
  searchParamsForm: {
    [key in string]: number | string;
  };
  handleFormChange: (form: { [key in string]: number | string }) => void;
  topK: number;
  handleConsistencyChange: (type: string) => void;
  wrapperClass?: string;
  setParamsDisabled: (isDisabled: boolean) => void;
  consistency_level: string;
}

export interface SearchResultView {
  // dynamic field names
  [key: string]: any;
  rank: number;
  distance: number;
}

export interface FieldOption extends Option {
  field: FieldObject;
}

export interface SearchParamInputConfig {
  label: string;
  key: searchKeywordsType;
  min?: number;
  max?: number;
  isInt?: boolean;
  // no value: empty string
  value: number | string;
  handleChange: (value: number) => void;
  className?: string;
  required?: boolean;
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
  travel_timestamp?: string;
  consistency_level?: string;
}

export interface SearchResult {
  // dynamic field names
  [key: string]: string | number;
  score: number;
}
