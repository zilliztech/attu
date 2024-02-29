import { LOADING_STATE } from '@/consts';
import { FieldSchema } from '@server/types';

export type StatusType = {
  status: LOADING_STATE;
  percentage?: string;
};

export type StatusActionType = {
  status: LOADING_STATE;
  percentage?: string;
  action?: Function;
  field: FieldSchema;
  collectionName: string;
  onIndexCreate: Function;
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
