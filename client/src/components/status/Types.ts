import { LOADING_STATE } from '@/consts';
import { SchemaObject } from '@server/types';

export type StatusType = {
  status: LOADING_STATE;
  percentage?: number;
};

export type StatusActionType = {
  status: LOADING_STATE;
  percentage?: string | number;
  action?: Function;
  schema: SchemaObject;
  collectionName: string;
  onIndexCreate?: Function;
};

// @todo need rename
export enum ChildrenStatusType {
  CREATING = 'creating',
  FINISH = 'finish',
  ERROR = 'error',
}

export type StatusIconType = {
  type: ChildrenStatusType;
  className?: string;
  size?: number;
};
