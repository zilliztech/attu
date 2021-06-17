export enum StatusEnum {
  'unloaded',
  'loaded',
  'error',
}
export type StatusType = {
  status: StatusEnum;
};

// @todo need rename
export enum ChildrenStatusType {
  CREATING = 'creating',
  FINISH = 'finish',
  ERROR = 'error',
}

export type StatusIconType = {
  type: ChildrenStatusType;
};
