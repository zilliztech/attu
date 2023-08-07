import { LOADING_STATE } from '@/consts';

// export enum StatusEnum {
//   'unloaded',
//   'loaded',
//   'error',
// }
export type StatusType = {
  status: LOADING_STATE;
  percentage?: string;
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
