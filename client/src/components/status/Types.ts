import { LOADING_STATE } from '@/consts';
import { SchemaObject } from '@server/types';

export type StatusActionType = {
  status: LOADING_STATE;
  percentage?: string | number;
  action?: Function;
  schema: SchemaObject;
  onIndexCreate?: Function;
};

// @todo need rename
