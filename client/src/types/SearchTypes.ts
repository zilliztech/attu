import { Option } from '@/components/customSelector/Types';
import { DataTypeEnum } from '@/consts';
import { FieldObject } from '@server/types';

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
  field: FieldObject;
}

export interface SearchResult {
  // dynamic field names
  [key: string]: string | number;
  score: number;
}
