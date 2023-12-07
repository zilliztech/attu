import { LOADING_STATE } from '@/consts';
import { FieldHttp } from '@/http';

export type StatusType = {
  status: LOADING_STATE;
  percentage?: string;
};

export type StatusActionType = {
  status: LOADING_STATE;
  percentage?: string;
  action?: Function;
  field: FieldHttp;
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
