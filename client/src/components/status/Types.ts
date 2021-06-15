export enum StatusEnum {
  'unloaded',
  'loaded',
  'error',
}
export type StatusType = {
  status: StatusEnum;
};

export type ChildrenStatusType = 'creating' | 'finish' | 'error';

export type StatusIconType = {
  type: ChildrenStatusType;
};
