import type { FieldObject } from '@server/types';
import type { Option } from '@/components/customSelector/Types';
import type { SxProps, Theme } from '@mui/material';

export interface SearchParamsProps {
  // default index type is FLAT
  indexType?: string;
  searchParamsForm: {
    [key in string]: number | string | boolean;
  };
  handleFormChange: (form: {
    [key in string]: number | string | boolean;
  }) => void;
  sx?: SxProps<Theme>;
  isManaged: boolean;
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

export interface SearchResult {
  // dynamic field names
  [key: string]: string | number;
  score: number;
}
